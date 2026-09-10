import { buildWorkbenchGuardrails } from './lib/prompt.js'
import { LegalWorkbench } from './lib/workbench.js'

export const name = 'legaldesk-harness'
export const inject = ['systemPrompt', 'tools', 'webServer', 'agents']

/**
 * Add invariant legal-workbench rules after the deployment persona.
 * The rules intentionally add no tools; case material is admitted by the
 * LegalDesk application layer as an explicit, logged snapshot.
 */
export function apply(ctx) {
  ctx.effect(() => ctx.systemPrompt.section({
    name: 'legaldesk:guardrails',
    order: 10,
    text: buildWorkbenchGuardrails(),
  }))
  ctx.effect(() => ctx.tools.guard(() => 'LegalDesk 首期禁止模型调用工具；只能处理本次显式提供且已记录的案件材料快照'))
  const dataDir = process.env.LEGALDESK_DATA_DIR ?? `${process.cwd()}/.legaldesk-data`
  const workbench = new LegalWorkbench({ dataDir, ctx })
  ctx.effect(() => () => workbench.close())
  ctx.effect(() => ctx.webServer.register({
    kind: 'prefix',
    path: '/legaldesk/api',
    handler: (req, res) => handleRequest(workbench, req, res),
  }))
}

async function handleRequest(workbench, req, res) {
  try {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1')
    const route = url.pathname.replace(/^\/legaldesk\/api\/?/, '')
    if (req.method === 'GET' && route === 'overview') {
      return json(res, 200, workbench.overview(url.searchParams.get('matterId') ?? undefined))
    }
    const body = await readJson(req)
    if (req.method === 'POST' && route === 'matters') return json(res, 201, workbench.createMatter(body))
    if (req.method === 'POST' && route === 'materials') return json(res, 201, await workbench.importMaterial(body))
    if (req.method === 'POST' && route === 'snapshots') return json(res, 201, workbench.createSnapshot(body))
    if (req.method === 'POST' && route === 'runs') return json(res, 202, await workbench.startRun(body))
    if (req.method === 'POST' && route === 'reviews') return json(res, 200, workbench.reviewArtifact(body))
    return json(res, 404, { error: { code: 'not-found', message: '接口不存在' } })
  } catch (error) {
    return json(res, error instanceof SyntaxError ? 400 : 422, { error: { code: error.code ?? 'invalid-request', message: String(error.message ?? error) } })
  }
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0
    req.on('data', chunk => { size += chunk.length; if (size > 22 * 1024 * 1024) reject(new Error('请求体过大')); else chunks.push(chunk) })
    req.on('end', () => { try { resolve(chunks.length === 0 ? {} : JSON.parse(Buffer.concat(chunks).toString('utf8'))) } catch (error) { reject(error) } })
    req.on('error', reject)
  })
}

function json(res, status, value) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' })
  res.end(JSON.stringify(value))
}
