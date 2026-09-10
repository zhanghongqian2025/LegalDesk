# LegalDesk 用户记忆与案件记忆设计

状态：设计完成，尚未启用自动写入。目标是在 DeepSeek Harness 的会话能力之上提供可审计、可撤回、严格分域的本地记忆。

## 研究结论

`dsh-memory` 的“会话结束后提炼、保留事件区间引用、按需展开原会话”思路可以复用，但它默认以 `$DSH_HOME/memory` 作为全局记忆域。LegalDesk 不应原样安装：全局检索可能把 A 案事实注入 B 案，且自动提炼未经律师确认的内容不应直接成为案件事实。

LegalDesk 采用自己的记忆投影层。Harness Session 仍是运行事实来源；LegalDesk SQLite 保存经过权限和审核控制的记忆条目。模型首期没有记忆写入工具。

## 两类记忆

### 用户记忆

只记录跨案件仍然成立的工作偏好，例如文书格式、称谓习惯、引用样式和审核清单。不得记录具体案件事实、当事人身份、证据内容或法律结论。

- 范围键：`scope_type=user`、`scope_id=<本机用户配置 ID>`
- 默认写入方式：用户明确保存，或 Agent 提议后由用户批准
- 注入顺序：在案件记忆之后，作为工作方式约束
- 删除：用户可查看、导出、撤回；撤回后不再注入新运行

### 案件记忆

只服务一个 `matter_id`，记录已经人工确认的事实、争点、决定、待办和材料解释。

- 范围键：`scope_type=matter`、`scope_id=<matter_id>`
- 每条必须引用材料快照，或引用 Harness Session 的事件区间
- 任何自动提炼首先进入 `suggested`，只有人工批准的 `approved` 条目可注入
- 禁止跨案件搜索、推荐或去重；案件关闭后默认冻结

## 数据模型

```sql
memory_entries(
  id, scope_type, scope_id, category, title, body,
  status, sensitivity, version, created_at, updated_at, approved_at
)
memory_citations(
  id, memory_id, session_id, event_start, event_end,
  snapshot_id, material_id, source_hash
)
memory_audit(id, memory_id, action, actor, note, at)
```

建议状态机：`suggested -> approved -> superseded | revoked`。修改已批准记忆时创建新版本，不覆盖旧内容。`memory_audit` 追加写，记录创建、批准、引用、替换、导出和撤回。

## 运行时流程

1. 启动 Legal Run 时锁定 `matter_id + snapshot_id`。
2. 只查询当前案件的 `approved` 案件记忆，再查询当前用户的 `approved` 偏好记忆。
3. 对条目数量和字符数设置上限；每条附带记忆 ID 和材料/Session 引用。
4. 作为独立系统提示段注入，并明确“记忆不是证据，冲突时以本次材料快照和人工指令为准”。
5. Run 完成后可产生记忆建议，但不能自动批准；审核界面展示来源、差异和影响范围。
6. 后续运行记录实际使用的记忆 ID/版本，确保可复现。

## 安全边界

- SQLite 查询必须同时包含 `scope_type + scope_id`；案件查询还要以当前 `matter_id` 重新校验。
- 不建立跨案件向量索引。未来如增加语义检索，每个案件使用独立命名空间和独立加密密钥。
- 引用只允许指向同一案件的 snapshot/material/session；用户偏好不得引用案件正文。
- 提示注入前进行敏感级别、状态、版本和字符预算检查。
- 记忆内容不进入桌面通知、遥测或错误上报。
- 删除采用“停止使用 + 审计留痕”；需要彻底销毁时同时清理索引、派生缓存和备份策略。

## 分阶段验收

P0：本地表结构、用户手工保存偏好、案件记忆人工增删改审、运行记录 memory-version 清单、跨案件隔离测试。

P1：从已完成 Session 生成带事件区间/材料快照引用的记忆建议，支持差异审核和冲突提示。

P2：案件内语义检索、记忆衰减和冲突合并；仍不开放跨案件全局事实搜索。

必须通过的负向测试：A 案记忆无法从 B 案 API 读取或注入；未批准建议不进入提示；撤回版本不进入新 Run；删除案件后其记忆和索引按数据策略同步处理。

## 参考实现

- `dsh-memory`：借鉴事件区间引用和按需展开，不采用其全局记忆域。
- LegalDesk 当前材料快照、Legal Run、Harness Session 和人工审核表：作为记忆来源及批准边界。
