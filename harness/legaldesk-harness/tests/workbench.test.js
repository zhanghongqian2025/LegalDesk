import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { LegalWorkbench } from '../lib/workbench.js'

test('persists a matter, imported material, immutable snapshot, run link and review', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'legaldesk-workbench-'))
  const workbench = new LegalWorkbench({ dataDir: dir, ctx: {} })
  try {
    const matter = workbench.createMatter({ title: '买卖合同纠纷', referenceNo: '2026-01' })
    const material = await workbench.importMaterial({ matterId: matter.id, name: '../合同.txt', mediaType: 'text/plain', data: Buffer.from('合同正文').toString('base64') })
    const snapshot = workbench.createSnapshot({ matterId: matter.id, materialIds: [material.id], label: '起诉前版本' })
    assert.equal(snapshot.manifest.materials[0].sha256, material.sha256)
    assert.equal(readFileSync(join(dir, 'materials', matter.id, `${material.id}-合同.txt`), 'utf8'), '合同正文')
    const createdAt = new Date().toISOString()
    workbench.db.addRun({ id: 'run-1', matterId: matter.id, snapshotId: snapshot.id, agentKey: 'document-drafter', sessionId: 'legal-session-1', status: 'completed', createdAt })
    workbench.db.addArtifact({ id: 'artifact-1', runId: 'run-1', title: '起诉状草稿', content: '待审核', status: 'pending_review', createdAt })
    const reviewed = workbench.reviewArtifact({ artifactId: 'artifact-1', status: 'approved', note: '律师已核对' })
    assert.equal(reviewed.status, 'approved')
    const state = workbench.overview(matter.id)
    assert.equal(state.runs[0].harness_session_id, 'legal-session-1')
    assert.equal(state.artifacts[0].reviewer_note, '律师已核对')
  } finally {
    workbench.close()
    rmSync(dir, { recursive: true, force: true })
  }
})

test('stores a derived local document snapshot without replacing the original', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'legaldesk-doc-'))
  const documentIntelligence = { convert: async () => ({ status: 'ready', text: '# 已解析合同\n价款 100 元', parser: 'dsh-doc', parserVersion: '0.1.1', pages: 2, ocrUsed: false, elapsedMs: 12, error: '' }) }
  const workbench = new LegalWorkbench({ dataDir: dir, ctx: {}, documentIntelligence })
  try {
    const matter = workbench.createMatter({ title: '解析测试' })
    const material = await workbench.importMaterial({ matterId: matter.id, name: '合同.pdf', mediaType: 'application/pdf', data: Buffer.from('fake-pdf').toString('base64') })
    assert.equal(material.parse_status, 'ready')
    assert.equal(material.parser, 'dsh-doc')
    assert.equal(material.page_count, 2)
    const snapshot = workbench.createSnapshot({ matterId: matter.id, materialIds: [material.id] })
    const prompt = workbench.buildPrompt({ matter, snapshot: workbench.db.getSnapshot(snapshot.id), agentDef: { name: '证据审查 Agent' }, instruction: '' })
    assert.match(prompt, /已解析合同/)
    assert.equal(readFileSync(join(dir, 'materials', matter.id, `${material.id}-合同.pdf`), 'utf8'), 'fake-pdf')
  } finally {
    workbench.close()
    rmSync(dir, { recursive: true, force: true })
  }
})
