# LegalDesk

LegalDesk 是面向律师、公司法务和法律服务团队的单机法律 Agent 工作台。仓库从 `0.3.0` 起以 DeepSeek Harness 为唯一 Agent 与前端运行基础；旧 React/Vite/Tauri/Pi 实现已经移除。

## 当前状态

当前已交付一个可验收的插件化纵向闭环：

- DeepSeek Harness 双端插件（Host + `dsh.client`），不修改 Harness 核心；
- SQLite 案件库和本地受管材料目录；
- 材料导入、显式选择、SHA-256 校验和不可变快照；
- 材料整理、证据审查、法律文书三个可视化 Agent 入口；
- Legal Run 与唯一 Harness Session ID 持久关联；
- Agent 输出自动形成待审核草稿，支持人工批准或退回；
- 通过 Harness Slot 注入的法律工作台 Client UI；
- 只读、无模型工具、人工审核和本地审计的安全基线；
- 本地 Harness Profile 安装、配置检查和开发启动器。

仓库中不存在可回退继续开发的旧 Tauri/Pi 运行链。PDF/OCR 正文抽取、备份恢复和机构权限仍属于后续阶段。

## 运行要求

- Node.js `>=22.19.0`；
- pnpm；
- 已安装或位于相邻目录的 DeepSeek Harness 源码；
- 运行模型时，由 Harness 管理的 DeepSeek 模型凭据。

默认查找 `/Users/zhanghongqian/Desktop/deepseek-harness` 的相邻 checkout；也可设置 `DEEPSEEK_HARNESS_DIR`。本地 Profile 默认写入 `.runtime/dsh`，案件库与材料默认写入 `.runtime/legaldesk-data`；分别可用 `LEGALDESK_DSH_HOME` 和 `LEGALDESK_DATA_DIR` 覆盖。

```sh
npm test
npm run build:client
npm run pack:harness
npm run release
npm run dsh:setup
npm run dsh:dump
npm run dsh:dev
```

`dsh:dev` 始终加载 [enforcement.patch.yml](./harness/legaldesk-harness/enforcement.patch.yml)，不允许普通 Profile 配置降低只读和无工具基线。真实模型调用仍可能把用户明确选择的材料发送给配置的模型提供方；“单机运行”不等于“模型必然离线”。

`npm run release` 会执行生产构建与测试，固定当前已审核的 DeepSeek Harness 提交，生成插件 tarball、SHA-256 校验文件、SPDX 清单、第三方许可证和单机发行启动器。发行物写入 `dist/releases/`，不包含 `.runtime`、案件数据或模型凭据。

普通用户桌面发行使用 `npm run desktop:mac` 生成 macOS DMG/PKG，Windows NSIS 安装包由 `desktop-release.yml` 在 Windows Runner 上生成。桌面版内置官方 Harness npm Runtime，无需用户安装 Node.js 或 pnpm；安装、图标启动、数据保留式卸载说明见 [桌面发行文档](./docs/DESKTOP_DISTRIBUTION.md)。

## 仓库结构

```text
harness/legaldesk-harness/   Host/Client 插件、SQLite、材料、运行、产物与安全策略
harness/legaldesk-client/    Client 插件实现位置说明
scripts/                     本地 Profile 启动与仓库不变量检查
docs/                        产品、功能、架构和重构决策
```

## 产品边界

- 案件是材料、会话、运行和产物的强制边界。
- 模型只接收本次明确选择且经过校验的材料快照。
- 所有模型产物默认是待人工审核草稿。
- 不提供公共法律咨询，不自动发送、签署或提交法律文件。
- 不默认开放 shell、任意文件、联网检索、技能、工作流或子 Agent。

详细要求见 [SPEC.md](./SPEC.md)、[功能清单](./docs/REBUILD_FUNCTIONS.md)、[架构](./docs/ARCHITECTURE.md) 和 [安全策略](./SECURITY.md)。
