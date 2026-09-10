import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const harnessRoot = resolve(process.env.DEEPSEEK_HARNESS_DIR ?? join(repoRoot, '..', 'deepseek-harness'))
const dshHome = resolve(process.env.LEGALDESK_DSH_HOME ?? join(repoRoot, '.runtime', 'dsh'))
const bundleRoot = join(repoRoot, 'harness', 'legaldesk-harness')
const enforcement = join(bundleRoot, 'enforcement.patch.yml')
const profileManifest = join(dshHome, 'profiles', 'web', 'package.json')

if (!existsSync(join(harnessRoot, 'apps', 'cli', 'src', 'bin.ts'))) {
  throw new Error(`未找到 DeepSeek Harness checkout：${harnessRoot}。请设置 DEEPSEEK_HARNESS_DIR。`)
}
if (!existsSync(join(harnessRoot, 'apps', 'web', 'dist', 'index.html'))) {
  throw new Error(`DeepSeek Harness 尚未构建：请先在 ${harnessRoot} 运行 pnpm install && pnpm run build`)
}

mkdirSync(dshHome, { recursive: true, mode: 0o700 })
const environment = {
  ...process.env,
  DSH_HOME: dshHome,
  LEGALDESK_DATA_DIR: resolve(process.env.LEGALDESK_DATA_DIR ?? join(repoRoot, '.runtime', 'legaldesk-data')),
}

if (!profileHasLegalDesk(profileManifest)) {
  await run('pnpm', ['dsh', 'plugin', '--profile', 'web', 'add', bundleRoot], environment)
}

const input = process.argv.slice(2)
if (input.includes('--setup-only')) {
  console.log(`LegalDesk Harness profile ready at ${dshHome}`)
  process.exit(0)
}

const dump = input.includes('--dump-config')
const forwarded = input.filter(arg => arg !== '--dump-config')
const args = ['dsh', '--profile', 'web', '--patch', enforcement]
if (dump) args.push('--dump-config')
else args.push(...(forwarded.length > 0 ? forwarded : ['--no-open']))
await run('pnpm', args, environment)

function profileHasLegalDesk(path) {
  if (!existsSync(path)) return false
  const manifest = JSON.parse(readFileSync(path, 'utf8'))
  return manifest?.dsh?.profile?.bundles?.includes('@civright/legaldesk-harness') === true
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
