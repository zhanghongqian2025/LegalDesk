import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  chmodSync,
  copyFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const project = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const plugin = JSON.parse(readFileSync(join(root, 'harness', 'legaldesk-harness', 'package.json'), 'utf8'))
const harnessRoot = resolve(process.env.DEEPSEEK_HARNESS_DIR ?? join(root, '..', 'deepseek-harness'))
const harnessPackage = JSON.parse(readFileSync(join(harnessRoot, 'package.json'), 'utf8'))
const harnessCommit = git(['rev-parse', 'HEAD'], harnessRoot).trim()
const harnessStatus = git(['status', '--porcelain'], harnessRoot).trim()

if (harnessStatus) throw new Error('DeepSeek Harness 工作树存在未提交修改，拒绝生成不可复现发行包。')

run('npm', ['run', 'build'], root)

const releaseName = `legaldesk-${project.version}-${process.platform}-${process.arch}`
const releasesRoot = join(root, 'dist', 'releases')
const output = join(releasesRoot, releaseName)
rmSync(output, { recursive: true, force: true })
mkdirSync(output, { recursive: true, mode: 0o755 })

const packResult = JSON.parse(run('npm', [
  'pack', '--json', '--workspace=false', './harness/legaldesk-harness', '--pack-destination', output,
], root))
const packedName = packResult[0].filename
const packedPath = join(output, packedName)
const releasePluginName = `legaldesk-harness-${plugin.version}.tgz`
const releasePluginPath = join(output, releasePluginName)
copyFileSync(packedPath, releasePluginPath)
rmSync(packedPath)

copyFileSync(join(root, 'scripts', 'release-launcher.mjs'), join(output, 'legaldesk.mjs'))
copyFileSync(join(root, 'harness', 'legaldesk-harness', 'enforcement.patch.yml'), join(output, 'enforcement.patch.yml'))
copyFileSync(join(root, 'LICENSE'), join(output, 'LICENSE'))
copyFileSync(join(root, 'THIRD_PARTY_NOTICES.md'), join(output, 'THIRD_PARTY_NOTICES.md'))
copyFileSync(join(harnessRoot, 'LICENSE'), join(output, 'DEEPSEEK_HARNESS_LICENSE'))
copyFileSync(join(harnessRoot, 'THIRD_PARTY_NOTICES.md'), join(output, 'DEEPSEEK_HARNESS_THIRD_PARTY_NOTICES.md'))
chmodSync(join(output, 'legaldesk.mjs'), 0o755)

writeFileSync(join(output, 'README.md'), releaseReadme({
  projectVersion: project.version,
  pluginVersion: plugin.version,
  harnessVersion: harnessPackage.version,
  harnessCommit,
}))
writeFileSync(join(output, 'sbom.spdx.json'), `${JSON.stringify(spdx({
  projectVersion: project.version,
  pluginVersion: plugin.version,
  harnessVersion: harnessPackage.version,
  harnessCommit,
}), null, 2)}\n`)

const files = readdirSync(output).sort()
const checksums = files.map(name => `${sha256(join(output, name))}  ${name}`).join('\n')
writeFileSync(join(output, 'SHA256SUMS'), `${checksums}\n`)

const archive = join(releasesRoot, `${releaseName}.tar.gz`)
rmSync(archive, { force: true })
run('tar', ['-czf', archive, '-C', releasesRoot, releaseName], root)
writeFileSync(`${archive}.sha256`, `${sha256(archive)}  ${releaseName}.tar.gz\n`)

console.log(`LegalDesk 发行包：${archive}`)
console.log(`SHA-256：${sha256(archive)}`)

function run(command, args, cwd) {
  return execFileSync(command, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] })
}

function git(args, cwd) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' })
}

function sha256(path) {
  const hash = createHash('sha256')
  hash.update(readFileSync(path))
  return hash.digest('hex')
}

function releaseReadme({ projectVersion, pluginVersion, harnessVersion, harnessCommit }) {
  return `# LegalDesk ${projectVersion} 单机发行包

本发行包提供 LegalDesk DeepSeek Harness 插件、强制安全配置、启动器、校验和与许可证文件。案件数据不会包含在发行包内。

## 运行要求

- Node.js 22.19 或更高版本；
- pnpm 11；
- 已构建的 DeepSeek Harness ${harnessVersion}，固定提交 \`${harnessCommit}\`；
- macOS/Linux/Windows 本机环境。本构建产物目标为 \`${process.platform}-${process.arch}\`。

将经过审核的 DeepSeek Harness 放到本目录的 \`deepseek-harness/\`，或设置 \`DEEPSEEK_HARNESS_DIR\` 指向其绝对路径，然后运行：

\`\`\`sh
node legaldesk.mjs --no-open --port 3100
\`\`\`

浏览器访问 \`http://127.0.0.1:3100/\`。启动器默认只用于本机访问；不要把该端口直接暴露到公网。

## 数据与升级

默认数据目录为 macOS 的 \`~/Library/Application Support/LegalDesk/data\`、Linux 的 \`~/.local/share/legaldesk/data\`，Windows 使用 \`%APPDATA%\\LegalDesk\\data\`。可用 \`LEGALDESK_HOME\` 或 \`LEGALDESK_DATA_DIR\` 覆盖。升级前必须停止服务并备份整个数据目录。

模型凭据由 DeepSeek Harness 管理，不应写入本目录、启动脚本或案件材料。使用外部模型时，明确选择的材料快照可能发送给模型提供方。

## 验证

先验证发行包未被修改：

\`\`\`sh
shasum -a 256 -c SHA256SUMS
node legaldesk.mjs --setup-only
\`\`\`

LegalDesk 插件版本：${pluginVersion}。所有 Agent 输出均为待人工审核草稿，不构成最终法律意见，也不会自动发送、签署或提交。
`
}

function spdx({ projectVersion, pluginVersion, harnessVersion, harnessCommit }) {
  const created = new Date().toISOString()
  return {
    spdxVersion: 'SPDX-2.3',
    dataLicense: 'CC0-1.0',
    SPDXID: 'SPDXRef-DOCUMENT',
    name: `LegalDesk-${projectVersion}`,
    documentNamespace: `https://legaldesk.local/spdx/${projectVersion}/${harnessCommit}`,
    creationInfo: { created, creators: ['Tool: LegalDesk release builder'] },
    packages: [
      { SPDXID: 'SPDXRef-LegalDesk', name: 'LegalDesk', versionInfo: projectVersion, downloadLocation: 'NOASSERTION', filesAnalyzed: false, licenseConcluded: 'MIT', licenseDeclared: 'MIT', copyrightText: 'Copyright (c) 2026 zhanghongqian2025' },
      { SPDXID: 'SPDXRef-LegalDeskPlugin', name: '@civright/legaldesk-harness', versionInfo: pluginVersion, downloadLocation: 'NOASSERTION', filesAnalyzed: false, licenseConcluded: 'MIT', licenseDeclared: 'MIT', copyrightText: 'Copyright (c) 2026 zhanghongqian2025' },
      { SPDXID: 'SPDXRef-DeepSeekHarness', name: 'DeepSeek Harness', versionInfo: harnessVersion, packageFileName: harnessCommit, downloadLocation: 'https://github.com/deepseek-ai/deepseek-harness', filesAnalyzed: false, licenseConcluded: 'MIT', licenseDeclared: 'MIT', copyrightText: 'NOASSERTION' },
    ],
    relationships: [
      { spdxElementId: 'SPDXRef-DOCUMENT', relationshipType: 'DESCRIBES', relatedSpdxElement: 'SPDXRef-LegalDesk' },
      { spdxElementId: 'SPDXRef-LegalDesk', relationshipType: 'CONTAINS', relatedSpdxElement: 'SPDXRef-LegalDeskPlugin' },
      { spdxElementId: 'SPDXRef-LegalDesk', relationshipType: 'DEPENDS_ON', relatedSpdxElement: 'SPDXRef-DeepSeekHarness' },
    ],
  }
}
