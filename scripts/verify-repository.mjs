import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const forbidden = [
  'src',
  'src-tauri',
  'public',
  'index.html',
  'vite.config.ts',
  'tailwind.config.js',
  'postcss.config.js',
]

const remaining = forbidden.filter(path => existsSync(resolve(root, path)))
if (remaining.length > 0) {
  throw new Error(`旧实现路径仍然存在：${remaining.join(', ')}`)
}

const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
if (manifest.dependencies || manifest.devDependencies) {
  throw new Error('仓库根不能重新引入独立前端或模型运行依赖；能力必须由 Harness 插件拥有')
}

for (const path of [
  'harness/legaldesk-harness/cordis.patch.yml',
  'harness/legaldesk-harness/enforcement.patch.yml',
  'harness/legaldesk-harness/lib/agent-catalog.js',
  'docs/REBUILD_FUNCTIONS.md',
  'docs/ARCHITECTURE.md',
]) {
  if (!existsSync(resolve(root, path))) throw new Error(`缺少重建基础文件：${path}`)
}

console.log('Repository contains only the DeepSeek Harness implementation foundation and product definitions.')
