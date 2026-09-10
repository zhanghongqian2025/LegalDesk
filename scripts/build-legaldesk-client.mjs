import { cpSync, existsSync, lstatSync, mkdirSync, readlinkSync, rmSync, symlinkSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dsh = resolve(process.env.DEEPSEEK_HARNESS_DIR ?? join(root, '..', 'deepseek-harness'))
const plugin = join(root, 'harness', 'legaldesk-harness')
const pnpmStore = join(dsh, 'node_modules', '.pnpm')
const manifestSeat = join(dsh, 'packages', 'extensions', 'legaldesk-harness')
if (!existsSync(join(dsh, 'packages', 'client', 'tsdown.client.ts'))) throw new Error(`DeepSeek Harness checkout 不完整：${dsh}`)

const links = [
  ['react', 'react@18.3.1/node_modules/react'],
  ['react-dom', 'react-dom@18.3.1_react@18.3.1/node_modules/react-dom'],
  ['@types/react', '@types+react@18.3.31/node_modules/@types/react'],
  ['@types/react-dom', '@types+react-dom@18.3.7_@types+react@18.3.31/node_modules/@types/react-dom'],
]
for (const [name, target] of links) ensureLink(join(plugin, 'node_modules', name), join(pnpmStore, target))

if (existsSync(manifestSeat) && lstatSync(manifestSeat).isSymbolicLink()) rmSync(manifestSeat)
mkdirSync(manifestSeat, { recursive: true })
cpSync(join(plugin, 'package.json'), join(manifestSeat, 'package.json'))
try {
  run(join(dsh, 'node_modules', '.bin', 'tsc'), ['-p', 'tsconfig.client.json'])
  run(join(dsh, 'node_modules', '.bin', 'tsdown'), ['--config', 'tsdown.config.ts', '--env.DSH_BUILD_FACE=client'])
} finally {
  rmSync(manifestSeat, { recursive: true, force: true })
}

function ensureLink(path, target) {
  mkdirSync(dirname(path), { recursive: true })
  if (existsSync(path)) {
    if (lstatSync(path).isSymbolicLink() && resolve(dirname(path), readlinkSync(path)) === resolve(target)) return
    throw new Error(`构建依赖位置已被占用：${path}`)
  }
  symlinkSync(target, path)
}
function run(command, args) {
  const result = spawnSync(command, args, { cwd: plugin, stdio: 'inherit' })
  if (result.status !== 0) throw new Error(`${command} 构建失败，退出码 ${result.status}`)
}
