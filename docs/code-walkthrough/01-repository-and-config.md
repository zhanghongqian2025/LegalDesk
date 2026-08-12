# 01. 仓库入口与构建配置导读

本文从仓库根目录开始，解释哪些自有配置和说明文件会影响 LegalDesk 的开发、构建、运行、安全审阅与发布。行号以本文编写时的工作树为准；后续修改文件后，应同步更新这里的范围。

## 1. 先看整体控制链

```text
package.json scripts
    ├─ npm run dev ───────> vite.config.ts ───────> index.html ───────> src/main.tsx
    ├─ npm run build ─────> tsconfig.json + Vite ─> dist/
    └─ npm run tauri ... ─> Tauri CLI ────────────> src-tauri/

.github/workflows/ci.yml
    ├─ 拒绝根包 install 生命周期脚本
    ├─ npm ci --ignore-scripts
    ├─ npm run build
    ├─ cargo check --locked
    └─ cargo test --locked

README / SPEC / SECURITY / docs/*
    └─ 定义产品边界、Pi 运行边界、人工审核要求和发布责任
```

配置的权威关系要分清：`package.json`、TypeScript/Vite 配置和 Tauri/Rust 清单决定程序怎样构建；`SPEC.md` 与当前代码决定 MVP 是否通过；README 和 docs 用来说明预期行为，但文档中的规划不能代替实现或测试证据。

## 2. 根目录：构建入口与仓库卫生

### `.gitignore`

- [`.gitignore:1-8`](../../.gitignore) 忽略 npm、Yarn、pnpm 和 Lerna 的日志。日志可能包含本机路径、命令参数或错误上下文，不应默认提交。
- [`.gitignore:10-14`](../../.gitignore) 排除 `node_modules`、前端构建产物 `dist` / `dist-ssr`、本地配置以及历史嵌套仓库目录 `.git.bak/`。注意：忽略规则只阻止新的未跟踪文件进入索引，不能自动移除已经被 Git 跟踪的内容。
- [`.gitignore:16-19`](../../.gitignore) 是 Pi 集成的敏感边界：本地 `.pi/` 状态、Tauri sidecar 二进制和 JSONL 会话文件不得进入仓库。这些位置可能包含提供方配置、运行记录或可执行物。
- [`.gitignore:21-30`](../../.gitignore) 排除 IDE 与操作系统文件，只允许未来显式提交 `.vscode/extensions.json`。

### `.vscode/extensions.json`

- [`.vscode/extensions.json:1-3`](../../.vscode/extensions.json) 向使用 VS Code 的贡献者推荐 `tauri-apps.tauri-vscode` 和 `rust-lang.rust-analyzer`。前者提供 Tauri 项目辅助，后者提供 Rust 语言服务。
- `recommendations` 只会在编辑器中显示安装建议，不会自动安装扩展，也不参与 `npm run build`、Cargo 编译、应用运行或 CI。扩展仍由开发者自行信任和更新，因此不能把本文件当作构建依赖锁。

### `package.json`

- [`package.json:1-5`](../../package.json) 定义私有 ESM 包 `legaldesk`，应用版本为 `0.2.0`。`private: true` 防止误发布到 npm；`type: module` 使 `.js` 配置使用 ESM 语法。
- [`package.json:6-11`](../../package.json) 是前端和桌面开发入口。`dev` 启动 Vite；`build` 先执行 TypeScript 检查，再构建静态资源；`preview` 仅预览前端产物；`tauri` 把后续参数交给 Tauri CLI。这里没有 `lint` 脚本，也没有安装生命周期脚本。
- [`package.json:12-20`](../../package.json) 是运行时前端依赖：Tauri IPC/插件、React 19、Lucide 图标和 Zustand 状态管理。新增依赖会进入最终供应链审阅范围。
- [`package.json:21-32`](../../package.json) 是构建时依赖，包括 Tauri CLI、React 类型、Vite、TypeScript、PostCSS 与 Tailwind。版本范围会由 `package-lock.json` 解析成具体版本。

安全提示：根包不得新增 `preinstall`、`install` 或 `postinstall`。CI 会直接拒绝这些键；依赖安装也使用 `--ignore-scripts`。如确有不可替代的生命周期需求，应单独进行供应链审阅，而不是删除守门规则。

### `package-lock.json`（生成文件）

- [`package-lock.json:1-6`](../../package-lock.json) 表明这是 npm lockfile v3，并记录根包名称、版本与完整依赖图。
- 该文件由 npm 根据 `package.json` 和 npm registry 元数据生成，`npm ci` 以它为唯一解析结果；它固定直接与传递依赖版本、下载地址、完整性哈希和平台条件，使 CI 与开发机尽量使用同一依赖集合。
- 不逐行解释其 2,700 多行内容，因为大部分是机器生成的重复包记录，人工逐行释义既容易失效，也不能替代审计。正确审阅方式是：核对根包依赖差异、检查新增来源与完整性字段、关注带安装脚本或原生二进制的包、运行许可证/SBOM 与漏洞工具，并确认 `npm ci --ignore-scripts` 能重建。
- 修改 `package.json` 后应使用受信任的 npm 版本更新锁文件并把两者作为同一个变更审阅；不要手工编辑单个传递依赖记录。

### `tsconfig.json`

- [`tsconfig.json:1-8`](../../tsconfig.json) 把浏览器应用编译目标设为 ES2020，启用 DOM 类型、ES 模块和类字段标准语义；`skipLibCheck` 跳过依赖声明文件的完整检查，以换取构建速度。
- [`tsconfig.json:9-16`](../../tsconfig.json) 使用适配 Vite 的 bundler 模块解析，允许 JSON 模块与 TS 扩展名导入，要求文件可独立转译，并由 Vite 负责输出；`jsx: react-jsx` 使用现代 React JSX 变换。
- [`tsconfig.json:17-21`](../../tsconfig.json) 打开严格类型检查、未使用局部变量/参数检查和 switch fallthrough 检查。这是当前最接近“静态 lint 门”的配置，但它不是 ESLint。
- [`tsconfig.json:23-25`](../../tsconfig.json) 仅包含 `src`，并引用构建工具专用的 `tsconfig.node.json`。因此 `npm run build` 会同时覆盖应用源码和 Vite 配置的类型关系。

### `tsconfig.node.json`

- [`tsconfig.node.json:1-7`](../../tsconfig.node.json) 为 Node 侧配置文件启用 composite project、ESNext 模块和 bundler 解析；`allowSyntheticDefaultImports` 兼容插件的默认导入形式。
- [`tsconfig.node.json:9-10`](../../tsconfig.node.json) 只检查 `vite.config.ts`，不会把 React 应用源文件重复纳入这一项目。

### ESLint 状态

当前仓库没有 `eslint.config.*`、`.eslintrc*`、ESLint 依赖或 `npm run lint`。因此：

- `npm run build` 的 `tsc` 阶段能捕获类型错误、未使用声明和部分控制流问题；
- 它不会覆盖 React Hooks 规则、可访问性、导入约定、复杂度或通用代码风格；
- 如果后续引入 ESLint，需要同时新增配置、锁定依赖、`lint` 脚本和 CI 步骤，不能仅在 README 中声称已启用。

### `vite.config.ts`

- [`vite.config.ts:1-5`](../../vite.config.ts) 加载 Vite/React 插件，并读取 Tauri 注入的 `TAURI_DEV_HOST`。第 4 行用 `@ts-expect-error` 处理当前 Node 全局类型缺口；如果后来引入 Node 类型，应重新评估该抑制是否仍必要。
- [`vite.config.ts:8-14`](../../vite.config.ts) 注册 React 插件并保留终端输出，以免 Rust/Tauri 错误被 Vite 清屏隐藏。
- [`vite.config.ts:15-26`](../../vite.config.ts) 固定开发端口 `1420`；端口被占用时立即失败。远程/移动端 Tauri 开发场景通过 `TAURI_DEV_HOST` 配置监听地址和 `1421` WebSocket HMR。
- [`vite.config.ts:27-30`](../../vite.config.ts) 排除 `src-tauri` 文件监听，防止 Rust 构建产物触发前端热更新循环。

### `postcss.config.js` 与 `tailwind.config.js`

- [`postcss.config.js:1-6`](../../postcss.config.js) 让 PostCSS 依次运行 Tailwind v4 插件和 Autoprefixer。它是 CSS 构建链入口，使用 ESM 导出是因为根包声明了 `type: module`。
- [`tailwind.config.js:1-6`](../../tailwind.config.js) 告诉 Tailwind 扫描 `index.html` 和 `src` 中的 JS/TS/JSX/TSX；动态拼接且不在源码中形成完整类名的样式可能不会进入构建产物。
- [`tailwind.config.js:7-32`](../../tailwind.config.js) 扩展主色、状态色和 surface 色；这些是旧版 Tailwind 主题值，若界面改用 CSS token，应避免两套颜色源继续漂移。
- [`tailwind.config.js:33-44`](../../tailwind.config.js) 定义系统中文字体栈、圆角和卡片阴影。
- [`tailwind.config.js:45-63`](../../tailwind.config.js) 定义淡入和上下滑动动画。组件使用这些动画时仍需遵守 `prefers-reduced-motion`，配置本身不会自动提供无动画降级。
- [`tailwind.config.js:64-67`](../../tailwind.config.js) 结束主题扩展且未注册额外 Tailwind 插件。

### `index.html`

- [`index.html:1-8`](../../index.html) 是 Vite 的 HTML 入口，设置编码、viewport、图标和窗口文档标题。当前 `lang="en"`、Vite 图标与 `Tauri + React + Typescript` 标题仍是脚手架值；正式发布前应替换为 LegalDesk 品牌与页面语言。
- [`index.html:10-13`](../../index.html) 提供 React 挂载节点 `#root`，并以 ESM 加载 `/src/main.tsx`。如果 ID 或入口路径变化，React 启动代码和这里必须同步。

> **明确待修缺口：脚手架品牌残留。** `index.html:2` 应根据界面实际语言改为合适的 `lang`（当前中文界面至少不应保留 `en`）；`index.html:5` 仍把 Vite logo 用作 favicon；`index.html:7` 仍显示脚手架标题。发布前必须替换为经过确认的 LegalDesk 网页/窗口品牌资源与标题，并检查构建产物中不再出现 Vite/Tauri/React 示例品牌。

### `public` 与 `src/assets` 的 SVG 静态资源

- [`public/tauri.svg:1-6`](../../public/tauri.svg) 是 Tauri 官方示例 logo 的可读 SVG 路径数据。全仓库引用检查没有发现它被 HTML、React 或 Tauri 配置引用，因此当前不会进入可见界面；它属于脚手架遗留，可在确认无运行时动态引用后删除，或明确保留为开发资料。
- [`public/vite.svg:1`](../../public/vite.svg) 是压缩成单行的 Vite logo SVG。`index.html:5` 仍通过 `/vite.svg` 引用它作为 favicon，所以它会被 Vite 从 `public/` 原样复制并进入前端构建产物。这是当前实际使用的脚手架品牌资源，也是发布前必须替换的缺口。
- [`src/assets/react.svg:1`](../../src/assets/react.svg) 是压缩成单行的 React logo SVG。全仓库没有导入或 URL 引用，当前不进入应用界面或构建依赖图；它是未使用的模板资源。
- SVG 是文本格式，因此这里可以按行定位；但 Vite/React 两个文件被上游模板压成单行，路径数据本身只是矢量几何，不适合逐坐标解释。审阅重点是来源、许可、是否引用、是否含脚本/外链以及是否符合品牌，而不是复述每个 path 数值。

### `README.md`

- [`README.md:1-5`](../../README.md) 给出一句话定位、开发版本和人工最终审核声明，是访客首先看到的责任边界。
- [`README.md:7-14`](../../README.md) 说明本地优先、模型数据流和零工具快照策略；“本地优先”没有被误写成“推理一定离线”。
- [`README.md:16-22`](../../README.md) 固定首期三个智能体及输入/产物范围，避免把产品描述成无限能力的聊天助手。
- [`README.md:24-28`](../../README.md) 记录 Pi 核心零 fork、RPC/SDK 薄适配和 `0.84.1` 精确兼容策略。
- [`README.md:30-58`](../../README.md) 给出 Node/Rust/Pi 环境、禁用生命周期脚本的安装方式以及前端、Rust、Tauri 命令。这些命令应与 CI 同步维护。
- [`README.md:60-85`](../../README.md) 提供仓库结构和权威文档入口，包括本次开发记录及本目录的全仓代码讲解，帮助新贡献者按产品、技术、Pi、安全和源码顺序继续阅读。
- [`README.md:87-93`](../../README.md) 声明尚未交付的生产能力，并链接项目 MIT 许可和第三方通知，防止原型能力被过度承诺。

### `SPEC.md`

- [`SPEC.md:1-14`](../../SPEC.md) 定义 0.2 MVP 目标和六项产品原则，其中案件边界、本地优先、人工审核、零工具快照、零 fork、可追溯直接约束实现。
- [`SPEC.md:16-43`](../../SPEC.md) 划定基础工作台、三个智能体和单次运行的最小闭环。这一段是功能验收的主入口。
- [`SPEC.md:44-51`](../../SPEC.md) 列出明确非目标，包括公众 SaaS、自动外部提交、shell/跨案件访问和未授权联网。
- [`SPEC.md:53-62`](../../SPEC.md) 固定 Pi `0.84.1`、显式安装、RPC 优先以及 `--no-tools --no-approve`；还给出文本类型与快照大小上限。
- [`SPEC.md:64-73`](../../SPEC.md) 是安全与合规检查表，覆盖路径、删除、工具权限、数据流、审核、审计、备份和 CI。
- [`SPEC.md:75-91`](../../SPEC.md) 用四个场景定义材料整理、证据审阅、文书起草和安全拒绝的预期结果。
- [`SPEC.md:93-99`](../../SPEC.md) 给出后续路线并明确规划不等于已交付。

### `SECURITY.md`

- [`SECURITY.md:1-5`](../../SECURITY.md) 说明仅维护最新分支，并明确当前开发版不能未经独立评估用于机密生产案件。
- [`SECURITY.md:7-18`](../../SECURITY.md) 规定私下报告漏洞和公开渠道中的敏感信息禁区，同时要求使用合成数据复现。
- [`SECURITY.md:20-34`](../../SECURITY.md) 定义安全模型：本地优先不等于离线，Pi 是不可信子进程；固定版本、显式安装、零工具、禁扩展、受管目录和人工审核共同形成 MVP 防线。
- [`SECURITY.md:36-46`](../../SECURITY.md) 记录仓库曾出现危险 `postinstall` 的事实与事件响应建议。没有发现当前进程或落地文件也不能证明机器从未受影响。
- [`SECURITY.md:48-57`](../../SECURITY.md) 给出安全构建命令，并规定 CI 拒绝根生命周期脚本；异常放行必须单独审阅和记录。
- [`SECURITY.md:59-67`](../../SECURITY.md) 是开发安全清单，要求不信任路径、备份、文档、RPC 和模型输出，并测试目录穿越、符号链接与跨案件访问。
- [`SECURITY.md:69-71`](../../SECURITY.md) 重申技术安全不等于法律正确，专业人员对最终成果负责。

### `LICENSE` 与 `THIRD_PARTY_NOTICES.md`

- [`LICENSE:1-13`](../../LICENSE) 是 LegalDesk 的 MIT 授权正文与版权声明，允许使用、修改、分发和再许可，但要求保留版权与许可声明。
- [`LICENSE:15-21`](../../LICENSE) 是无担保和责任限制条款。它不替代各第三方组件自己的许可。
- [`THIRD_PARTY_NOTICES.md:1-3`](../../THIRD_PARTY_NOTICES.md) 说明 manifest/lockfile 才是具体构建的依赖清单，并要求生产发布前生成 SBOM/许可报告。
- [`THIRD_PARTY_NOTICES.md:5-13`](../../THIRD_PARTY_NOTICES.md) 记录 Pi 上游、包名、兼容版本、MIT 许可和零 fork 使用方式。
- [`THIRD_PARTY_NOTICES.md:15-24`](../../THIRD_PARTY_NOTICES.md) 覆盖其他 npm/Rust/SQLite 依赖及发布前的完整许可核对步骤。

### `SAAS_TASKS.md`

- [`SAAS_TASKS.md:1-9`](../../SAAS_TASKS.md) 是兼容旧链接的归档指针，不是当前任务列表。它明确否决“面向普通大众、完全云端”的旧方向，并把读者导向历史文件；当前需求以 `SPEC.md` 为准。

## 3. `.github`：持续集成与合并门

### `.github/workflows/ci.yml`

- [`.github/workflows/ci.yml:1-10`](../../.github/workflows/ci.yml) 将工作流命名为 CI，在所有 PR 和 `main` push 上触发，并只授予内容读取权限。
- [`.github/workflows/ci.yml:12-19`](../../.github/workflows/ci.yml) 在 Ubuntu runner 上创建 20 分钟限时任务并检出仓库。限时可以避免异常构建无限占用执行器。
- [`.github/workflows/ci.yml:21-35`](../../.github/workflows/ci.yml) 在安装依赖前读取根 `package.json`，一旦发现 `preinstall`、`install` 或 `postinstall` 就失败。这是对历史供应链问题的第一道显式门。
- [`.github/workflows/ci.yml:37-47`](../../.github/workflows/ci.yml) 固定 Node 20、启用 npm 缓存、用锁文件且禁用脚本安装，然后执行 `npm run build`。这同时验证 TypeScript 和 Vite 产物。
- [`.github/workflows/ci.yml:49-59`](../../.github/workflows/ci.yml) 安装稳定 Rust 工具链以及 Linux 上编译 Tauri 所需的 WebKitGTK、AppIndicator、SVG 和打包系统库。
- [`.github/workflows/ci.yml:61-67`](../../.github/workflows/ci.yml) 缓存 `src-tauri` 的 Cargo 产物并使用 `--locked` 做 Rust 编译检查，确保不会在 CI 中悄悄重解依赖。
- [`.github/workflows/ci.yml:69-70`](../../.github/workflows/ci.yml) 运行 Rust 测试，重点承载路径、备份和智能体运行安全边界的回归验证。

当前工作流是验证门，不是发布流水线：它不会签名、notarize、公证、上传安装包或创建 GitHub Release。若增加发布 job，应另行定义密钥最小权限、受保护环境、制品校验和第三方许可产物。

## 4. `docs`：产品、运行与发布契约

### `docs/PRODUCT.md`

- [`docs/PRODUCT.md:1-11`](../PRODUCT.md) 定义产品服务对象、核心场景，并排除面向公众的自动法律咨询定位。
- [`docs/PRODUCT.md:13-22`](../PRODUCT.md) 从形态、数据、架构、自动化、责任和集成六个维度说明差异化选择。
- [`docs/PRODUCT.md:24-38`](../PRODUCT.md) 用流程图串起案件、材料、智能体、Pi、待审核产物和人工处置。
- [`docs/PRODUCT.md:40-59`](../PRODUCT.md) 分别规定三个首期智能体能做什么、必须标注什么以及不得产生哪些动作。
- [`docs/PRODUCT.md:61-72`](../PRODUCT.md) 解释本地优先和私有部署的真实含义，明确机构能力仍是演进目标。
- [`docs/PRODUCT.md:74-80`](../PRODUCT.md) 定义克制、专业、突出风险与可访问性的体验原则。
- [`docs/PRODUCT.md:82-90`](../PRODUCT.md) 给出闭环效率、来源可追溯、幻觉修正、越权阻止和人工审核等质量指标。
- [`docs/PRODUCT.md:92-102`](../PRODUCT.md) 列出非目标并说明 0.2 是重新定位后的开发版，功能状态最终看代码与 SPEC。

### `docs/TECHNICAL.md`

- [`docs/TECHNICAL.md:1-25`](../TECHNICAL.md) 展示 React—Tauri/Rust—Pi—模型提供方的总体架构，以及零工具快照与 RPC 事件流。
- [`docs/TECHNICAL.md:27-51`](../TECHNICAL.md) 分解 React、Rust/Tauri 和 Pi Adapter 的职责，确保密钥、路径校验和进程管理不落到浏览器层。
- [`docs/TECHNICAL.md:53-73`](../TECHNICAL.md) 定义受管数据目录逻辑结构和所有不可信路径的重构、规范化、归属验证规则。
- [`docs/TECHNICAL.md:75-92`](../TECHNICAL.md) 给出 `agent_runs`、`agent_events`、`agent_artifacts` 的审计语义和默认 `pending` 审核状态。
- [`docs/TECHNICAL.md:94-105`](../TECHNICAL.md) 描述 Pi 版本检查、无 shell 参数启动、RPC JSONL、零工具、文本快照、时间/输出上限和清理流程。
- [`docs/TECHNICAL.md:107-118`](../TECHNICAL.md) 把文件、Pi、模型提供方、输出、依赖与备份逐一映射到威胁和 MVP 控制。
- [`docs/TECHNICAL.md:120-131`](../TECHNICAL.md) 定义本地和 CI 的最低构建/测试门，并要求生命周期脚本例外单独审阅。
- [`docs/TECHNICAL.md:133-145`](../TECHNICAL.md) 规定 Pi 精确版本升级流程并列出尚未交付的生产能力。

### `docs/PI_INTEGRATION.md`

- [`docs/PI_INTEGRATION.md:1-11`](../PI_INTEGRATION.md) 是 Pi 决策记录：上游、固定包版本、核心零 fork 和领域能力归属。
- [`docs/PI_INTEGRATION.md:13-22`](../PI_INTEGRATION.md) 解释为什么当前优先 RPC，并把 SDK 保留为更深宿主集成的未来路径。
- [`docs/PI_INTEGRATION.md:24-35`](../PI_INTEGRATION.md) 规定 Pi 由用户/管理员显式安装、运行前检查版本；示例命令不等于组织生产分发流程。
- [`docs/PI_INTEGRATION.md:37-55`](../PI_INTEGRATION.md) 给出启动参数安全意图：RPC、`--no-tools`、`--no-approve`、禁用未审阅加载项、受管会话目录和 Rust 侧快照。
- [`docs/PI_INTEGRATION.md:57-74`](../PI_INTEGRATION.md) 明确允许的文本类型和大小，并禁止 shell、写入、跨案件读取、外部提交以及直接处理未受控二进制文档。
- [`docs/PI_INTEGRATION.md:76-83`](../PI_INTEGRATION.md) 把材料视为可能含提示注入的不可信数据，要求来源区分、待核验标识和人工审核。
- [`docs/PI_INTEGRATION.md:85-94`](../PI_INTEGRATION.md) 说明模型提供方、联网和材料范围必须对用户可见，尤其关注保密、地域、留存和训练政策。
- [`docs/PI_INTEGRATION.md:96-108`](../PI_INTEGRATION.md) 定义未安装、版本不符、越界、无效 RPC、异常退出、取消和超时的失败行为。
- [`docs/PI_INTEGRATION.md:110-119`](../PI_INTEGRATION.md) 是升级清单，禁止自动跟随 `latest`。

### `docs/USER_MANUAL.md`

- [`docs/USER_MANUAL.md:1-18`](../USER_MANUAL.md) 面向最终用户说明人工审核责任、Pi 固定版本显式安装和模型提供方合规前提。
- [`docs/USER_MANUAL.md:20-36`](../USER_MANUAL.md) 说明如何建立案件边界、导入材料，并提醒文件进入工作区不代表其真实性或内容已被验证。
- [`docs/USER_MANUAL.md:38-50`](../USER_MANUAL.md) 给出智能体通用操作流程和零工具文本快照限制。
- [`docs/USER_MANUAL.md:52-86`](../USER_MANUAL.md) 为三个智能体分别给出适用场景、任务示例与人工复核重点。
- [`docs/USER_MANUAL.md:88-104`](../USER_MANUAL.md) 说明正式文书、证据记录、备份与外部模型数据流的责任边界。
- [`docs/USER_MANUAL.md:106-126`](../USER_MANUAL.md) 提供 Pi 安装/版本、材料不可读、运行失败和安全报告的排查入口。
- [`docs/USER_MANUAL.md:128-133`](../USER_MANUAL.md) 明确开发版、权限/加密/离线交付和法律检索等当前限制。

### `docs/DEVELOPMENT_LOG_2026-08-13.md`

- [`docs/DEVELOPMENT_LOG_2026-08-13.md:1-14`](../DEVELOPMENT_LOG_2026-08-13.md) 固定本次产品重定位、Pi 零 fork 适配、三个智能体和既有功能修复范围。
- [`docs/DEVELOPMENT_LOG_2026-08-13.md:16-32`](../DEVELOPMENT_LOG_2026-08-13.md) 记录危险生命周期脚本、路径与权限整改、主机只读复核证据及不能据此排除历史入侵的边界。
- [`docs/DEVELOPMENT_LOG_2026-08-13.md:34-52`](../DEVELOPMENT_LOG_2026-08-13.md) 说明大模型调用链、当前机器未安装 Pi、provider 健康检查缺口和首版文本格式限制。
- [`docs/DEVELOPMENT_LOG_2026-08-13.md:54-62`](../DEVELOPMENT_LOG_2026-08-13.md) 把读者导向三册按文件/行号组织的全仓代码讲解。
- [`docs/DEVELOPMENT_LOG_2026-08-13.md:64-77`](../DEVELOPMENT_LOG_2026-08-13.md) 保存构建、依赖审计、Rust 检查/测试和覆盖核验结果，并明确 clippy 告警。
- [`docs/DEVELOPMENT_LOG_2026-08-13.md:79-81`](../DEVELOPMENT_LOG_2026-08-13.md) 规定本次分支/草稿 PR 发布方式和生产使用边界。

### 历史文档

- [`docs/迭代讨论记录.md:1-3`](../迭代讨论记录.md) 已声明这是 2026-03 的历史探索，当前权威来源是 PRODUCT、SPEC 和 PI_INTEGRATION。
- [`docs/迭代讨论记录.md:5-128`](../迭代讨论记录.md) 保留早期功能、问题和路线讨论，仅用于理解项目演变；其中 OpenAI/Claude 直连、云同步等内容不能作为当前实现要求。
- [`docs/archive/SAAS_TASKS-2026-03.md:1-3`](../archive/SAAS_TASKS-2026-03.md) 明确标记旧 SaaS 方向已经被替代。
- [`docs/archive/SAAS_TASKS-2026-03.md:5-48`](../archive/SAAS_TASKS-2026-03.md) 原样保留当时面向公众、完全云端的设想，供决策追溯，不参与构建、运行或发布验收。

## 5. Rust 锁文件（跨目录但影响构建）

### `src-tauri/.gitignore`

- [`src-tauri/.gitignore:1-3`](../../src-tauri/.gitignore) 排除 Cargo 的 `target/`，其中包含平台相关的中间产物、可执行文件和打包输出，不能作为源码提交。
- [`src-tauri/.gitignore:5-7`](../../src-tauri/.gitignore) 排除 Tauri 自动生成的 capability schema。schema 可由当前工具链再生；若未来要在 CI 中校验其漂移，应采用专门的生成/比较步骤，而不是直接取消忽略。

### `src-tauri/icons/*`（应用打包图标）

这些文件都是图像或平台图标容器，没有可按“源码行”解释的文本结构。它们通常由 `tauri icon <source>` 从一张高分辨率源图生成。二进制逐行解释没有意义，审阅应核对像素尺寸、透明通道、视觉内容、来源/商标权、平台显示效果、文件哈希以及 Tauri 配置是否引用。

当前资源可按同源尺寸族理解：

- [`src-tauri/icons/32x32.png`](../../src-tauri/icons/32x32.png)、[`128x128.png`](../../src-tauri/icons/128x128.png)、[`128x128@2x.png`](../../src-tauri/icons/128x128@2x.png)：分别是 32×32、128×128 和 256×256（2x）RGBA PNG。三者在 `src-tauri/tauri.conf.json:35-37` 被明确列入 bundle 图标，因此当前打包仍会使用。
- [`src-tauri/icons/icon.icns`](../../src-tauri/icons/icon.icns)：macOS 多尺寸图标容器，在 `tauri.conf.json:38` 被明确引用，供 `.app` / DMG 等 macOS 产物使用。
- [`src-tauri/icons/icon.ico`](../../src-tauri/icons/icon.ico)：Windows ICO 多图标容器，在 `tauri.conf.json:39` 被明确引用，供 Windows 可执行文件/安装产物使用。
- [`src-tauri/icons/icon.png`](../../src-tauri/icons/icon.png)：512×512 RGBA PNG，通常作为通用主图或重新生成尺寸族的输入；当前 `tauri.conf.json` 和应用源码没有直接引用它。
- Windows 方形瓦片族 [`Square30x30Logo.png`](../../src-tauri/icons/Square30x30Logo.png)、[`Square44x44Logo.png`](../../src-tauri/icons/Square44x44Logo.png)、[`Square71x71Logo.png`](../../src-tauri/icons/Square71x71Logo.png)、[`Square89x89Logo.png`](../../src-tauri/icons/Square89x89Logo.png)、[`Square107x107Logo.png`](../../src-tauri/icons/Square107x107Logo.png)、[`Square142x142Logo.png`](../../src-tauri/icons/Square142x142Logo.png)、[`Square150x150Logo.png`](../../src-tauri/icons/Square150x150Logo.png)、[`Square284x284Logo.png`](../../src-tauri/icons/Square284x284Logo.png)、[`Square310x310Logo.png`](../../src-tauri/icons/Square310x310Logo.png) 和 [`StoreLogo.png`](../../src-tauri/icons/StoreLogo.png)：这是 Tauri 图标生成器常见的 Windows/MSIX 尺寸输出。当前仓库的 `tauri.conf.json` 没有逐个引用这些 PNG，源码检索也没有引用；现有 Windows bundle 明确使用的是 `icon.ico`。若未来启用 Store/MSIX 专用清单，应重新确认这些文件是否由工具链隐式消费，并在实际 Windows 制品中验证，不能仅因文件存在就认定它们正在使用。

当前整组仍是默认 Tauri 图标风格而非经确认的 LegalDesk 品牌资产。与 `index.html` 的 Vite favicon 一样，这是明确的发布前品牌缺口：应从有权使用的 LegalDesk 主图统一重新生成全平台尺寸族，再检查 macOS、Windows、任务栏、安装器和高 DPI 场景；不能只替换其中一张 PNG。

### `src-tauri/Cargo.lock`（生成文件）

- [`src-tauri/Cargo.lock:1-4`](../../src-tauri/Cargo.lock) 明确声明该文件由 Cargo 自动生成，当前 lockfile 格式版本为 4。
- 它由 `src-tauri/Cargo.toml` 的直接依赖解析产生，固定每个 crate 的具体版本、registry 来源、checksum 和依赖边，使 `cargo check --locked` 与 `cargo test --locked` 拒绝未记录的重新解析。
- 不逐行解释其 5,700 多行 `[[package]]`，原因与 npm 锁文件相同：逐包自然语言复述会快速过期，也不是有效的供应链验证。审阅应聚焦 `Cargo.toml` 变更造成的锁文件差异、新 registry/git 来源、checksum、重复大版本、原生/系统绑定以及许可证和安全公告。
- 依赖变更后用受信任的 Cargo 更新锁文件；应用仓库应提交它。CI 使用 `--locked`，所以清单与锁文件不同步会直接失败。

## 6. 发布前从哪里开始核对

1. 从 `package.json`、`package-lock.json`、`src-tauri/Cargo.toml` 和 `Cargo.lock` 确认实际依赖与版本。
2. 运行 `.github/workflows/ci.yml` 等价的安装、构建和测试命令，确认没有绕过 lifecycle guard。
3. 用 `SPEC.md` 的四个场景和安全清单验收功能，而不是按历史讨论中的勾选项判断完成度。
4. 对照 `SECURITY.md` 和 `PI_INTEGRATION.md` 检查 Pi 版本、零工具、材料快照、目录边界、日志和人工审核。
5. 对照 `LICENSE` 与 `THIRD_PARTY_NOTICES.md` 生成完整 SBOM/第三方许可材料。
6. 修正 `index.html` 的脚手架语言、标题和 Vite favicon；用同一 LegalDesk 品牌源图重新生成 `src-tauri/icons/*`，并验证各平台实际制品不再显示 Vite/Tauri/React 示例品牌。
7. 当前 CI 没有发布 job；在签名密钥、受保护环境和制品校验就绪前，不应把通过 CI 等同于可生产发布。
