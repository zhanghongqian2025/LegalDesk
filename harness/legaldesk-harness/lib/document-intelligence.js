import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'

const require = createRequire(import.meta.url)

export function createDocumentIntelligence({ runtimeDir, logger = () => {} } = {}) {
  let enginePromise
  return {
    async convert({ name, mediaType, bytes }) {
      const started = Date.now()
      try {
        enginePromise ??= loadEngine(runtimeDir, logger)
        const engine = await enginePromise
        const result = await engine.convertFile({
          file: { name, mediaType, size: bytes.length, bytes },
          options: { outputFormat: 'md', ocr: false, tableMode: 'accurate' },
        })
        return {
          status: 'ready',
          text: result.markdown ?? result.text ?? JSON.stringify(result.json ?? ''),
          parser: 'dsh-doc',
          parserVersion: '0.1.1',
          outputFormat: result.format,
          pages: result.metadata?.pages ?? null,
          ocrUsed: result.metadata?.ocrUsed === true,
          elapsedMs: result.stats?.elapsedMs ?? Date.now() - started,
          error: '',
        }
      } catch (error) {
        logger('LegalDesk document parsing failed', { name, error: String(error) })
        return {
          status: 'failed', text: '', parser: 'dsh-doc', parserVersion: '0.1.1',
          outputFormat: 'md', pages: null, ocrUsed: false, elapsedMs: Date.now() - started,
          error: safeError(error),
        }
      }
    },
  }
}

async function loadEngine(runtimeDir, logger) {
  const packagePath = require.resolve('dsh-doc/package.json')
  const moduleUrl = pathToFileURL(join(dirname(packagePath), 'lib', 'engine', 'create.js')).href
  const { createDocumentEngine } = await import(moduleUrl)
  return createDocumentEngine({
    engine: 'auto', ...(runtimeDir ? { runtimeDir } : {}), ocrBackend: 'auto',
    timeoutMs: 120_000, maxFileBytes: 15 * 1024 * 1024,
    enableLocalFiles: false, enableRemoteUrls: false, allowedLocalRoots: [],
    allowWorkspaceFiles: false, allowPrivateUrls: false, defaultOcr: false,
    defaultTableMode: 'accurate', defaultOutputFormat: 'md', maxOutputChars: 120_000, debug: false,
  }, { log: logger })
}

function safeError(error) {
  const text = String(error?.message ?? error).replace(/[\r\n]+/g, ' ').trim()
  return text.slice(0, 500) || 'document parsing failed'
}
