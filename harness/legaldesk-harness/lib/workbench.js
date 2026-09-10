import { createHash, randomUUID } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { LegalDeskDatabase } from './database.js'
import { createDocumentIntelligence } from './document-intelligence.js'
import { createLegalDeskNotifier } from './notifier.js'
import { pricingFromEnv, summarizeUsage } from './usage.js'

export const LEGAL_AGENTS = Object.freeze([
  { key: 'material-organizer', name: '材料整理 Agent', description: '梳理材料目录、主体、时间线与缺口，不作未经材料支持的判断。' },
  { key: 'evidence-reviewer', name: '证据审查 Agent', description: '分析证明目的、关联性、真实性风险与补强建议。' },
  { key: 'document-drafter', name: '法律文书 Agent', description: '依据选定快照生成结构化文书草稿，明确待核事实。' },
])

const TEXT_TYPES = new Set(['text/plain', 'text/markdown', 'application/json', 'text/csv'])

export class LegalWorkbench {
  constructor({ dataDir, ctx, documentIntelligence, notifier, pricing } = {}) {
    this.ctx = ctx
    this.dataDir = resolve(dataDir)
    this.materialDir = join(this.dataDir, 'materials')
    this.derivedDir = join(this.dataDir, 'derived')
    mkdirSync(this.materialDir, { recursive: true, mode: 0o700 })
    mkdirSync(this.derivedDir, { recursive: true, mode: 0o700 })
    this.db = new LegalDeskDatabase(join(this.dataDir, 'legaldesk.sqlite'))
    this.documentIntelligence = documentIntelligence ?? createDocumentIntelligence({
      runtimeDir: process.env.LEGALDESK_DOCUMENT_RUNTIME_DIR,
      logger: (message, details) => this.ctx?.logger?.warn?.(message, details),
    })
    this.notifier = notifier ?? createLegalDeskNotifier()
    this.pricing = pricing ?? pricingFromEnv()
  }

  close() { this.db.close() }
  overview(matterId) {
    return {
      agents: LEGAL_AGENTS,
      matters: this.db.listMatters(),
      ...(matterId === undefined ? {} : {
        materials: this.db.listMaterials(matterId),
        snapshots: this.db.listSnapshots(matterId),
        runs: this.db.listRuns(matterId),
        artifacts: this.db.listArtifacts(matterId),
      }),
    }
  }

  createMatter(input) {
    const title = requiredText(input.title, '案件名称', 160)
    return this.db.createMatter({ id: `matter-${randomUUID()}`, title, referenceNo: cleanText(input.referenceNo, 80), createdAt: now() })
  }

  async importMaterial(input) {
    if (this.db.getMatter(input.matterId) === undefined) throw business('matter-not-found', '案件不存在')
    const name = basename(requiredText(input.name, '文件名', 240))
    const mediaType = cleanText(input.mediaType, 120) || 'application/octet-stream'
    const bytes = Buffer.from(requiredText(input.data, '文件内容'), 'base64')
    if (bytes.length === 0 || bytes.length > 15 * 1024 * 1024) throw business('material-size', '单个材料须为 1 字节至 15MB')
    const id = `material-${randomUUID()}`
    const dir = join(this.materialDir, input.matterId)
    mkdirSync(dir, { recursive: true, mode: 0o700 })
    const path = join(dir, `${id}-${name}`)
    writeFileSync(path, bytes, { mode: 0o600, flag: 'wx' })
    let parsed = {
      status: 'not_required', parser: '', parserVersion: '', text: '', pages: null,
      ocrUsed: false, elapsedMs: null, error: '',
    }
    if (!TEXT_TYPES.has(mediaType)) parsed = await this.documentIntelligence.convert({ name, mediaType, bytes })
    let derivedPath = null
    let derivedSha256 = null
    if (parsed.status === 'ready' && parsed.text.trim()) {
      const derivedMatterDir = join(this.derivedDir, input.matterId)
      mkdirSync(derivedMatterDir, { recursive: true, mode: 0o700 })
      derivedPath = join(derivedMatterDir, `${id}.md`)
      writeFileSync(derivedPath, parsed.text, { mode: 0o600, flag: 'wx' })
      derivedSha256 = createHash('sha256').update(parsed.text).digest('hex')
    }
    return this.db.addMaterial({ id, matterId: input.matterId, name, mediaType, byteSize: bytes.length,
      sha256: createHash('sha256').update(bytes).digest('hex'), storedPath: path, importedAt: now(),
      parseStatus: parsed.status, parser: parsed.parser, parserVersion: parsed.parserVersion,
      derivedPath, derivedSha256, parsedAt: parsed.status === 'not_required' ? null : now(),
      parseError: parsed.error, pageCount: parsed.pages, ocrUsed: parsed.ocrUsed, parseElapsedMs: parsed.elapsedMs,
    })
  }

  createSnapshot(input) {
    const ids = Array.isArray(input.materialIds) ? [...new Set(input.materialIds.map(String))] : []
    const rows = this.db.materialRows(input.matterId, ids)
    if (rows.length !== ids.length || rows.length === 0) throw business('materials-invalid', '请选择当前案件中的至少一份材料')
    const manifest = { version: 1, materials: rows.map(row => ({
      id: row.id, name: row.name, mediaType: row.media_type, byteSize: row.byte_size, sha256: row.sha256,
    })) }
    return this.db.addSnapshot({ id: `snapshot-${randomUUID()}`, matterId: input.matterId,
      label: cleanText(input.label, 160) || `材料快照 ${new Date().toLocaleString('zh-CN')}`, manifest, createdAt: now() })
  }

  async startRun(input) {
    const agentDef = LEGAL_AGENTS.find(item => item.key === input.agentKey)
    if (agentDef === undefined) throw business('agent-invalid', '未知法律 Agent')
    const snapshot = this.db.getSnapshot(input.snapshotId)
    if (snapshot === undefined || snapshot.matter_id !== input.matterId) throw business('snapshot-invalid', '材料快照不属于当前案件')
    const matter = this.db.getMatter(input.matterId)
    if (matter === undefined) throw business('matter-not-found', '案件不存在')
    const runId = `run-${randomUUID()}`
    const sessionId = `legal-${randomUUID()}`
    const createdAt = now()
    const matterDir = join(this.dataDir, 'matters', input.matterId)
    mkdirSync(matterDir, { recursive: true, mode: 0o700 })
    const handle = await this.ctx.agents.create({
      sessionId,
      meta: { cwd: matterDir },
      setup: (agentCtx) => {
        agentCtx.effect(() => agentCtx.systemPrompt.section({
          name: `legaldesk:agent:${agentDef.key}`,
          order: 20,
          text: `${agentDef.name}\n${agentDef.description}\n只可依据本次材料快照；所有结论注明依据，输出必须标记为待人工审核草稿。`,
        }))
      },
    })
    this.db.addRun({ id: runId, matterId: input.matterId, snapshotId: input.snapshotId,
      agentKey: agentDef.key, sessionId, status: 'running', createdAt })
    const prompt = this.buildPrompt({ matter, snapshot, agentDef, instruction: input.instruction })
    handle.agent.followup({ id: randomUUID(), role: 'user', content: [{ type: 'text', text: prompt }], source: { kind: 'user' } })
    void this.captureWhenIdle({ handle, runId, agentDef })
    return { id: runId, sessionId, status: 'running', createdAt }
  }

  buildPrompt({ matter, snapshot, agentDef, instruction }) {
    const rows = this.db.materialRows(matter.id, snapshot.manifest.materials.map(item => item.id))
    const sections = rows.map(row => {
      if (!TEXT_TYPES.has(row.media_type)) {
        if (row.parse_status === 'ready' && row.derived_path) {
          return `### ${row.name}\n${readFileSync(row.derived_path, 'utf8').slice(0, 120_000)}`
        }
        return `### ${row.name}\n[材料正文解析${row.parse_status === 'failed' ? '失败' : '尚未完成'}；仅记录校验值 ${row.sha256}]`
      }
      const bytes = readFileSync(row.stored_path)
      const text = bytes.toString('utf8').slice(0, 120_000)
      return `### ${row.name}\n${text}`
    })
    return [`案件：${matter.title}`, `任务角色：${agentDef.name}`,
      `律师指令：${cleanText(instruction, 2000) || '请依据材料完成该角色的标准审查任务。'}`,
      `快照：${snapshot.label}（${snapshot.id}）`, ...sections,
      '输出要求：列明材料依据、待核事实和风险；结尾注明“本产物为待人工审核草稿”。'].join('\n\n')
  }

  async captureWhenIdle({ handle, runId, agentDef }) {
    const started = Date.now()
    try {
      await handle.agent.whenIdle()
      const usage = summarizeUsage(handle.agent.session.events, this.pricing)
      const messages = handle.agent.session.deriveMessages()
      const assistant = [...messages].reverse().find(message => message.role === 'assistant')
      const content = assistant?.content?.map(block => block.type === 'text' ? block.text : '').join('\n').trim()
      if (!content) throw new Error('Harness Session 未产生可审核文本')
      const completedAt = now()
      this.db.addArtifact({ id: `artifact-${randomUUID()}`, runId, title: `${agentDef.name}草稿`,
        content, status: 'pending_review', createdAt: completedAt })
      this.db.completeRun(runId, completedAt, usage)
      await this.notifySafely({ status: 'completed', durationMs: Date.now() - started })
    } catch (error) {
      const usage = summarizeUsage(handle?.agent?.session?.events, this.pricing)
      this.db.failRun(runId, String(error), now(), usage)
      await this.notifySafely({ status: 'failed', durationMs: Date.now() - started })
    }
  }

  async notifySafely(event) {
    try { await this.notifier(event) } catch (error) {
      this.ctx?.logger?.warn?.('LegalDesk desktop notification failed', { error: String(error) })
    }
  }

  reviewArtifact(input) {
    if (!['approved', 'changes_requested'].includes(input.status)) throw business('review-invalid', '审核状态无效')
    const row = this.db.reviewArtifact(input.artifactId, input.status, cleanText(input.note, 4000), now())
    if (row === undefined) throw business('artifact-not-found', '草稿不存在')
    return row
  }
}

function cleanText(value, max = 1_000_000) { return typeof value === 'string' ? value.trim().slice(0, max) : '' }
function requiredText(value, label, max) { const text = cleanText(value, max); if (!text) throw business('input-invalid', `${label}不能为空`); return text }
function now() { return new Date().toISOString() }
function business(code, message) { return Object.assign(new Error(message), { code }) }
