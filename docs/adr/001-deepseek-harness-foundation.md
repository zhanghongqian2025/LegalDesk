# ADR-001：以 DeepSeek Harness Bundle 重建 LegalDesk

- 状态：已接受
- 日期：2026-08-22

## 决策

LegalDesk 新架构以 DeepSeek Harness 的插件树为 Agent 运行基础，通过独立的 `@civright/legaldesk-harness` Bundle 叠加法律领域能力和安全策略。首期运行组合固定为：

1. `@deepseek-ai/dsh-base`
2. `@deepseek-ai/dsh-web-app`
3. `@civright/legaldesk-harness`

LegalDesk 不修改 Harness 的 Agent Loop。案件、材料、法律运行和产物审核属于 LegalDesk 领域层；Harness Session ID 只是运行关联标识，不能取代案件主键或审计记录。

## 原因

Harness 已提供插件组合、流式 Agent 循环、持久会话、模型路由、审批、沙箱和 Web Surface。复用这些能力可以删除旧 Pi 进程适配层，同时保留替换模型、策略和界面的扩展点。独立 Bundle 使法律策略在 Harness 升级时可单独审查和回归，避免长期维护核心分叉。

## 安全基线

Harness 的标准 Web 预设是编程 Agent，可能装载 shell、文件、技能、子 Agent 和工作流工具。LegalDesk 首期关闭预设目录和全部模型工具，将沙箱固定为只读并保留人工审批。案件材料通过 LegalDesk 校验后形成显式文本快照，再作为日志化输入进入 Agent；仅设置工作目录不构成案件隔离。

默认关闭 Harness 遥测。模型 API 调用仍可能把所选文本发送给配置的模型提供方，因此运行前必须展示提供方、联网状态和材料范围。

Harness 的 Profile 与用户级 patch 位于 Bundle 之后，能覆盖 Bundle 配置。因此发布版 LegalDesk 启动器必须把 `enforcement.patch.yml` 作为最后一层 `--patch` overlay 传入，并在启动前校验最终配置的不变量；Bundle 负责安装组合，最终 overlay 负责不可被普通用户配置降级的产品基线。LegalDesk 插件还在 Harness 工具执行管线注册全局单调拒绝 Guard，使重新注册或改名的工具也不能执行。独立 `DSH_HOME` 只能由当前操作系统用户写入。

## 模块边界

- `legaldesk-domain`：案件标识、材料引用、Agent 角色、运行状态和审核状态，不依赖 Cordis、Web 或具体数据库。
- `legaldesk-application`：创建案件、导入材料、创建运行、接受/退回产物等用例。
- `legaldesk-harness`：Bundle 配置、法律提示词、Harness Session/事件适配和策略映射。
- `legaldesk-storage-local`：版本化迁移、受管文件存储、事务/恢复和本地备份。
- `legaldesk-web`：案件工作台和审核界面，通过类型化网关访问应用层。

## 后果

旧 Tauri/Pi 实现已于 0.3 重建开始时删除，不能再作为新能力的扩展点。旧 Git 历史仅供理解功能和设计独立数据导入器，禁止复制旧运行链回新架构。首阶段先建立安全可验证的 Harness 骨架，后续再接案件仓储和专用 Client UI。DeepSeek Harness 当前是开发预览版本，LegalDesk 必须固定经过验证的版本，并把 Profile dump、关键会话回放和权限拒绝纳入升级门禁。
