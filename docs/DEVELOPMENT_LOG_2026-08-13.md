# 2026-08-13 开发与复核记录

## 本次目标

将 LegalDesk 从通用案件管理原型调整为桌面级法律工作平台，并用“Pi 核心零 fork、LegalDesk 薄适配”的方式建立材料整理、证据审阅和文书起草三个首期智能体。同时复核历史供应链问题、文件系统边界、模型接入状态，并补齐可持续维护的全仓代码讲解。

## 已交付

- 产品定位统一为案件、材料、证据、文书和智能体协同；本地优先，可向机构私有部署演进，所有智能体输出必须人工最终审核。
- 保留 Tauri 2、React、Rust 和 SQLite 主体，新增 Pi RPC 适配层，没有复制或修改 Pi 核心。
- 建立三个固定智能体注册项、案件内显式选材、流式运行、取消、超时、运行/事件/草稿持久化和历史回看。
- 删除前端直接调用模型及浏览器保存 API Key 的旧路径，模型认证与提供方配置由 Pi 运行环境负责。
- 修复资料入口未真正纳管文件、工作台案件导航、14 天期限过滤、法律文书版本号等既有问题。
- 将冲突的公众 SaaS 方向归档，并补充产品、技术、用户、Pi、安全、许可、CI 和代码走读文档。

## 安全问题结论

仓库历史上的危险根 `postinstall` 已经从 `package.json` 删除，锁文件在禁用脚本条件下重建；CI 会在安装依赖前拒绝根 `preinstall`、`install` 和 `postinstall`，随后只执行 `npm ci --ignore-scripts`。

本次还完成了：

- 删除误提交的 `.git.bak` 嵌套仓库并加入忽略规则；
- 移除 WebView 的 shell 和通用 fs 插件/权限；
- 为案件、材料、备份及删除操作增加 UUID、案件归属、canonical path 和受管根目录检查；
- 备份导入不再信任绝对材料路径，只接受单一受管文件名；
- 生产窗口关闭 devtools，并设置仅允许应用自身脚本的 CSP；
- Pi 以 `--no-tools --no-approve` 运行，且关闭 extensions、skills、prompt templates、themes 和 context files；
- 模型只接收用户明确选择、属于当前案件的 UTF-8 文本快照，并限制单文件、总输入、输出、stderr 和运行时间。

2026-08-13 的只读主机复核未发现 `/tmp/.sshd` 文件或对应的 `gvfsd-network`、`systemd-network-helper` launchd 项；进程复查没有确认存活的匹配进程。这只能说明没有发现当前明显指标，不能证明历史脚本从未运行或主机从未受影响。如果曾在危险脚本存在时运行过 `npm install`，仍应使用可信终端检测工具复核主机并轮换当时用户可访问的 GitHub、npm、SSH、云服务和模型提供方凭据。

仓库级问题已经修复，但当前开发版不等于完成生产级安全认证。仍需重点处理可信 Pi sidecar/签名、操作系统沙箱、数据静态加密、受控 opener、强一致审计、完整附件备份、机构身份/RBAC 和部署审查；完整清单见 [后端代码走读](./code-walkthrough/03-backend-rust.md#7-安全状态与优先级)。

## 大模型接入结论

当前桌面工具具备大模型接入代码链路：

```text
React AgentPanel
  -> Tauri invoke
  -> Rust 校验案件、智能体和选定材料
  -> Pi 0.84.1 RPC 子进程
  -> Pi 配置的模型提供方
  -> JSONL 流式事件
  -> SQLite 运行审计与 draft/pending 草稿
```

当前机器没有检测到 `pi` 命令，因此尚未完成真实模型端到端调用。要启用智能体，需要由用户或机构显式安装审核过的 `@earendil-works/pi-coding-agent@0.84.1`，并在 Pi 中配置获批准的模型提供方、模型和凭据。LegalDesk 自身不把密钥写入前端状态或浏览器存储。

`get_pi_status` 当前只验证 Pi 二进制存在且自报版本精确匹配，不验证 provider、凭据、网络或模型推理健康度。所以界面显示“Pi 运行时就绪”只能解释为 RPC 二进制兼容，不能等同于模型一定可用。正式部署应增加推理健康检查和机构级 provider 策略。

首版只允许 `txt`、`md`、`markdown`、`csv`、`json`、`xml`、`html`、`htm` 和 `log` UTF-8 文本。PDF、Office、图片和扫描件会被明确拒绝，后续需要受控解析/OCR 管线。

## 代码讲解

全仓解释从 [代码讲解总入口](./code-walkthrough/README.md) 开始：

1. [仓库入口与构建配置](./code-walkthrough/01-repository-and-config.md)
2. [React 前端](./code-walkthrough/02-frontend.md)
3. [Rust、Tauri 与 Pi 后端](./code-walkthrough/03-backend-rust.md)

讲解按文件和连续行号范围覆盖有意义的导入、类型、函数、SQL、状态、JSX、CSS 与配置。锁文件、SVG/PNG/ICO/ICNS 等生成或二进制内容逐文件说明用途、来源、引用和审阅方法，不机械翻译哈希或字节。

## 复核证据

2026-08-13 重新执行：

| 检查 | 结果 |
| --- | --- |
| `npm run build` | 通过，Vite 转换 1764 个模块并生成生产前端产物 |
| `npm audit --audit-level=high --ignore-scripts` | 通过，0 项已知漏洞 |
| `cargo check --locked` | 通过 |
| `cargo test --locked` | 通过，6 项测试、0 失败 |
| `git diff --check` | 通过 |
| 跟踪文件走读覆盖检查 | 原仓库 69 个跟踪文件均能在讲解目录中找到对应说明 |

`cargo clippy --locked --all-targets -- -D warnings` 仍会因 `add_evidence` 和 `update_evidence` 的参数数量触发两个 `too_many_arguments` lint；这不是已确认漏洞，但应通过输入 DTO 重构并集中值域校验。

## 发布边界

本次代码和解释应发布到 `codex/pi-legal-workbench` 分支，并以草稿 PR 合入 `main`。在 CI、审阅和必要的事件响应完成前，不应直接把开发分支视为可处理真实机密案件的生产版本。
