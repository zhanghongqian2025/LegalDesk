# LegalDesk 技术设计

## 1. 架构目标

在保留现有 Tauri + React + Rust + SQLite 桌面架构的前提下，用薄适配层接入 Pi。LegalDesk 管理案件边界、智能体定义、材料授权、运行审计和人工审核；Pi 管理模型会话与工具调用。上游核心保持零 fork。

```text
React 工作台
  ├─ 案件、卷宗、文书与模板 UI
  └─ 智能体选择、运行状态与待审核产物
           │ Tauri invoke / events
Rust 本地服务
  ├─ SQLite 业务数据与审计记录
  ├─ 应用管理的案件文件目录
  └─ Pi Adapter
       ├─ 版本检查：必须为 0.84.1
       ├─ 运行边界：当前案件 + 已选材料
       ├─ 零工具运行：--no-tools --no-approve
       ├─ Rust 生成所选 UTF-8 文本的受限内容快照
       └─ RPC JSONL 事件归一化
           │ 子进程 stdio
Pi CLI 0.84.1
           │ 由用户配置
模型提供方或本地模型
```

## 2. 组件职责

### React 工作台

- 展示案件、文件、智能体和运行状态。
- 收集任务指令和材料选择，不在浏览器端直接保存模型密钥。
- 订阅归一化后的运行事件。
- 将智能体产物显示为“待人工审核”，并持续展示责任边界。

### Rust/Tauri 层

- 承担所有数据库和受管文件系统操作。
- 校验 UUID、案件归属、规范化路径和数据导入结构。
- 启动、监控、取消 Pi 进程；不通过 shell 拼接命令。
- 把运行、事件、错误和产物持久化，向前端发送稳定事件结构。
- 仅把用户明确选择的材料暴露给当前运行。

### Pi Adapter

- 当前兼容 `@earendil-works/pi-coding-agent@0.84.1`。
- 默认使用 Pi CLI RPC 模式的 JSONL 输入输出。
- 将 LegalDesk 的智能体定义转换为系统提示、允许工具和任务提示。
- 禁用未经审阅的扩展、技能、主题、提示模板和上下文文件。
- 进程工作目录限定到应用管理的案件目录。
- 保持接口足够窄，以便未来切换到 Pi SDK 而不改动产品层。

## 3. 数据边界

应用数据目录由运行时决定，不应在产品文档中承诺固定为用户主目录下某个手写路径。逻辑结构如下：

```text
LegalDesk application data/
├── legaldesk.db
└── cases/
    └── <case UUID>/
        ├── imported files
        └── .legaldesk/
            └── sessions/
```

所有从前端、备份文件或数据库读取的路径都视为不可信输入：

1. 校验案件和对象标识符格式。
2. 以应用受管根目录重新构造目标路径。
3. 规范化或解析符号链接后再次验证目标仍位于允许根目录内。
4. 删除和覆盖前进行同样校验。
5. 备份恢复不得直接采用备份中记录的绝对路径。

## 4. 智能体数据模型

建议使用以下持久化边界；字段可随实现迁移，但审计语义必须保留。

```text
agent_runs
  id, case_id, agent_id, instruction, document_ids,
  status, started_at, finished_at, error

agent_events
  id, run_id, sequence, kind, payload, created_at

agent_artifacts
  id, run_id, case_id, kind, title, content,
  review_status, created_at, updated_at
```

`review_status` 的首期默认值为 `pending`。后续可增加 `accepted`、`revised`、`rejected`，但任何状态变化都应记录操作者和时间。

## 5. RPC 运行协议

1. 调用 Pi 前执行 `--version` 检查并精确匹配 `0.84.1`。
2. 使用独立参数数组启动进程，禁止构造 shell 命令字符串。
3. 使用 `--mode rpc`，通过 stdin 写入 JSONL 请求，通过 stdout 读取 JSONL 事件。
4. 使用 `--no-tools --no-approve`；Rust 只快照归属和路径校验通过的 UTF-8 文本，单文件 256 KiB、单次合计 1 MiB。
5. 单次运行最长 10 分钟，草稿输出最多 2 MiB，超限即终止并标记失败。
6. 将当前案件目录设为进程工作目录，会话目录放在该案件的受管子目录中。
7. 将 Pi 事件映射成 LegalDesk 稳定事件，例如 `run_status`、`text_delta`、`artifact`、`error`。
8. 运行结束或取消后关闭子进程句柄并持久化最终状态。

更完整的版本、参数和失败策略见 [PI_INTEGRATION.md](./PI_INTEGRATION.md)。

## 6. 信任边界与威胁

| 边界 | 主要风险 | MVP 控制 |
|---|---|---|
| 文件导入 | 目录穿越、符号链接、恶意文件名 | 重构目标路径、归属校验、受管目录 |
| Pi 进程 | 工具越权、扩展自动加载、命令执行 | 零工具模式、禁用扩展、禁止项目授权 |
| 模型提供方 | 敏感材料外发、日志保留 | 显式配置、运行前提示、私有部署选项 |
| 智能体输出 | 幻觉、错误法律引用、提示注入 | 来源标注、待审核状态、人工最终审核 |
| 依赖安装 | npm 生命周期脚本执行恶意载荷 | `npm ci --ignore-scripts`、CI 清单检查 |
| 备份恢复 | 任意路径写入、结构污染 | schema/ID/路径校验、恢复到受管目录 |

Pi 本身不是权限沙箱。首版因此不向 Pi 暴露任何工具，而由 Rust 预先生成受限材料快照；Pi 进程和模型输出仍应视为不可信组件，机构部署应进一步使用操作系统沙箱、容器或受限账户。

## 7. 构建与 CI

本地与 CI 的最低验证门：

```bash
npm ci --ignore-scripts
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml
```

CI 在安装前拒绝根 `package.json` 中的 `preinstall`、`install` 和 `postinstall` 脚本，并设置 npm 忽略生命周期脚本。任何确实需要生命周期脚本的依赖变更都必须单独审阅和记录，不能直接放宽全局规则。

## 8. 版本与升级

- LegalDesk 应用版本与 Pi 兼容版本分别管理。
- 当前 Pi 兼容版本固定为 `0.84.1`，不接受 `latest` 或范围匹配。
- 升级步骤：阅读上游变更和安全说明、更新兼容测试、验证 RPC 事件与工具参数、审阅第三方许可，再调整固定版本。
- 不在应用启动时静默下载、替换或执行 Pi 二进制。

## 9. 当前限制

- 当前版本要求用户显式安装兼容 Pi CLI。
- 完整操作系统级沙箱、密钥托管、组织权限和集中审计尚未交付。
- 模型内容是否离开本机取决于用户选择的提供方；产品不得把“本地数据管理”描述为“推理必然离线”。
- UI 或数据库中出现的功能入口不代表已通过生产安全评审。
