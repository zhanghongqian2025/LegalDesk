import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const releaseRoot = dirname(fileURLToPath(import.meta.url))
const harnessRoot = resolve(
  process.env.DEEPSEEK_HARNESS_DIR ?? join(releaseRoot, 'deepseek-harness'),
)
const plugin = join(releaseRoot, 'legaldesk-harness-0.3.0.tgz')
const enforcement = join(releaseRoot, 'enforcement.patch.yml')
const appRoot = resolve(process.env.LEGALDESK_HOME ?? defaultAppRoot())
const dshHome = resolve(process.env.LEGALDESK_DSH_HOME ?? join(appRoot, 'dsh'))
const dataDir = resolve(process.env.LEGALDESK_DATA_DIR ?? join(appRoot, 'data'))
const profileManifest = join(dshHome, 'profiles', 'web', 'package.json')

requireFile(join(harnessRoot, 'apps', 'cli', 'src', 'bin.ts'), 'DeepSeek Harness 源码')
requireFile(join(harnessRoot, 'apps', 'web', 'dist', 'index.html'), '已构建的 DeepSeek Harness Web')
requireFile(plugin, 'LegalDesk 插件发行包')
requireFile(enforcement, 'LegalDesk 强制安全配置')

mkdirSync(dshHome, { recursive: true, mode: 0o700 })
mkdirSync(dataDir, { recursive: true, mode: 0o700 })

const environment = {
  ...process.env,
  DSH_HOME: dshHome,
  LEGALDESK_DATA_DIR: dataDir,
}

if (!profileUsesRelease(profileManifest)) {
  await run('pnpm', ['dsh', 'plugin', '--profile', 'web', 'add', plugin], environment)
}

const input = process.argv.slice(2)
if (input.includes('--setup-only')) {
  console.log(`LegalDesk 已安装：${appRoot}`)
  process.exit(0)
}

const forwarded = input.length > 0 ? input : ['--no-open', '--port', '3100']
await run('pnpm', ['dsh', '--profile', 'web', '--patch', enforcement, ...forwarded], environment)

function defaultAppRoot() {
  if (process.platform === 'darwin') return join(homedir(), 'Library', 'Application Support', 'LegalDesk')
  if (process.platform === 'win32') return join(process.env.APPDATA ?? homedir(), 'LegalDesk')
  return join(process.env.XDG_DATA_HOME ?? join(homedir(), '.local', 'share'), 'legaldesk')
}

function profileUsesRelease(path) {
  if (!existsSync(path)) return false
  const manifest = JSON.parse(readFileSync(path, 'utf8'))
  const dependency = manifest?.dependencies?.['@civright/legaldesk-harness']
  return manifest?.dsh?.profile?.bundles?.includes('@civright/legaldesk-harness') === true
    && typeof dependency === 'string'
    && dependency.includes('legaldesk-harness-0.3.0.tgz')
}

function requireFile(path, label) {
  if (!existsSync(path)) throw new Error(`未找到${label}：${path}`)
}

function run(command, args, env) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, { cwd: harnessRoot, env, stdio: 'inherit' })
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (signal) reject(new Error(`${command} 被信号 ${signal} 终止`))
      else if (code !== 0) reject(new Error(`${command} 退出码 ${code}`))
      else resolveRun()
    })
  })
}
