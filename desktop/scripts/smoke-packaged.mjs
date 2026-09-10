import { spawn } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

const desktopRoot = resolve(import.meta.dirname, '..')
const executable = process.platform === 'darwin'
  ? join(desktopRoot, 'release', 'mac-arm64', 'LegalDesk.app', 'Contents', 'MacOS', 'LegalDesk')
  : join(desktopRoot, 'release', 'win-unpacked', 'LegalDesk.exe')
const userData = mkdtempSync(join(tmpdir(), 'legaldesk-packaged-smoke-'))
const child = spawn(executable, [`--user-data-dir=${userData}`], { stdio: ['ignore', 'pipe', 'pipe'] })
let output = ''

try {
  const url = await new Promise((resolveUrl, reject) => {
    const timeout = setTimeout(() => reject(new Error(`桌面 Host 启动超时\n${output}`)), 60000)
    const collect = chunk => {
      output += chunk.toString()
      const match = output.match(/dsh web: (http:\/\/127\.0\.0\.1:\d+)/)
      if (match !== null) {
        clearTimeout(timeout)
        resolveUrl(match[1])
      }
    }
    child.stdout.on('data', collect)
    child.stderr.on('data', collect)
    child.once('exit', code => {
      clearTimeout(timeout)
      reject(new Error(`桌面应用提前退出，退出码 ${code}\n${output}`))
    })
  })
  const response = await fetch(`${url}/legaldesk/api/overview`)
  if (!response.ok) throw new Error(`LegalDesk API 返回 ${response.status}`)
  const overview = await response.json()
  if (!Array.isArray(overview.matters) || overview.matters.length !== 0) {
    throw new Error('全新桌面数据目录不应包含案件')
  }
  console.log(`Packaged LegalDesk smoke passed: ${url}`)
} finally {
  child.kill('SIGTERM')
  await Promise.race([
    new Promise(resolveExit => child.once('exit', resolveExit)),
    new Promise(resolveTimeout => setTimeout(resolveTimeout, 5000)),
  ])
  if (child.exitCode === null) child.kill('SIGKILL')
  rmSync(userData, { recursive: true, force: true })
}
