# LegalDesk Harness Client（已并入双端插件）

法律工作台 Client UI 已实现在 `../legaldesk-harness/src/client/`，构建产物为 `../legaldesk-harness/lib/client.js`。它不是独立前端应用，而是 `@civright/legaldesk-harness` 的 `./client` 导出，由 Harness `client-modules` 动态加载。

当前首版已经覆盖：

1. 案件列表和当前案件切换。
2. 材料导入、哈希、显式选择和快照。
3. 三个法律 Agent 的可视化入口。
4. Legal Run、Harness Session ID 与运行状态。
5. 草稿查看、批准和退回修改。

界面使用 Harness 的语义 token、CSS Modules、Slot 声明和标准 Session hooks。案件业务数据来自 LegalDesk Host RPC，不复制到独立全局状态；Client Store 只保存选择、草稿和面板等查看状态。
