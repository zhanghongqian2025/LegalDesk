# LegalDesk DeepSeek Harness 架构

## 组合

```text
DeepSeek Harness base
  + Web app Host/Client runtime
  + LegalDesk Host Bundle
  + LegalDesk Client plugins
  + final enforcement overlay
```

Harness 负责 Session、Agent Loop、模型路由、流式事件、审批、沙箱、持久会话和 Web Client 插件加载。LegalDesk 负责案件、材料快照、法律角色、运行关联、产物审核与法律审计。

## 分层

- **Domain**：案件、材料、角色、运行、产物、审核状态；不依赖 Harness 或存储实现。
- **Application**：创建案件、导入材料、启动运行、取消运行、接受/驳回产物。
- **Host plugins**：通过同源 `/legaldesk/api` 暴露应用用例，注入模型上下文，关联 Session 并执行安全策略。
- **Local infrastructure**：版本化 SQLite、受管文件存储、原子写入、恢复和备份。
- **Client plugins**：使用 Harness Runtime、Session hooks 和 Slot 系统组成案件导航、材料区、会话区和产物审核区。

## 关键标识

`MatterId`、`MaterialId`、`LegalRunId`、`ArtifactId` 和 `HarnessSessionId` 是不同的不可互换标识。Harness Session 必须关联一个 Legal Run，Legal Run 必须关联一个 Matter；UI 不从全局事件猜测当前运行。

## 事件与状态

模型可见输入先记录再发送。Harness Session 事件保留原始运行轨迹；LegalDesk 事件记录案件语义，如选材快照创建、运行状态变化、产物产生和人工审核。启动时将遗留 `running` 记录协调为 `interrupted`，所有状态更新保持幂等。

## 前端原则

不建立第二个独立 React 应用。LegalDesk UI 作为 Harness Client 插件注册到现有 Slot 系统，业务数据来自 Host RPC 与 Harness Session 对象层，跨组件的查看状态才进入 Client Store。样式使用 Harness 语义 token 和 CSS Modules，避免 Tailwind 与独立主题系统造成两套视觉和状态基础设施。

## 交付顺序

1. Host Bundle 与最终安全 overlay。
2. 案件/材料领域与版本化本地仓储。
3. 快照创建、Legal Run 与 Harness Session 关联。
4. 事件投影、取消/恢复和产物审核。
5. Client 工作台框架、案件导航、材料、Agent、运行和审核界面。（已完成首版）
6. PDF/Office 本地正文解析、Token 统计与桌面完成通知。（已完成受控适配；OCR 运行时待随平台发行包配置）
7. 用户记忆与案件记忆采用独立范围键、人工批准和来源引用；设计见 `MEMORY_ARCHITECTURE.md`。
8. 运行恢复、备份恢复与导出，以及机构策略、权限与发布加固。
