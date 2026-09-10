# @civright/legaldesk-harness

LegalDesk 的 DeepSeek Harness 双端插件 Bundle。Host 半侧提供 SQLite 案件库、材料受管存储、快照、Legal Run、Harness Session 关联和人工审核 API；Client 半侧通过 `dsh.client` 与 Harness Slot 系统注入法律工作台。

## 本地组合

需要已安装或已从源码构建的 DeepSeek Harness。将本目录安装进 `legaldesk` Profile：

```sh
dsh plugin --profile legaldesk add ./harness/legaldesk-harness
```

然后确保该 Profile 的 Bundle 顺序为：

1. `@deepseek-ai/dsh-base`
2. `@deepseek-ai/dsh-web-app`
3. `@civright/legaldesk-harness`

启动前先检查最终配置。产品启动器必须把本 Bundle 的 patch 同时作为最后一层 `--patch` overlay 传入，确保它排在 Profile 和用户级配置之后：

```sh
dsh --profile legaldesk --patch ./harness/legaldesk-harness/enforcement.patch.yml --dump-config
dsh --profile legaldesk --patch ./harness/legaldesk-harness/enforcement.patch.yml
```

当前 Bundle 会关闭 Harness 自带的编程 Agent 预设和所有模型工具，并注册全局单调拒绝 Guard；即使其他配置以新 ID 注册工具，执行也会被拒绝。Bundle 层本身可以被用户级 `cordis.patch.yml` 覆盖，所以发布版不能省略最终 overlay。

## 环境变量

- `DEEPSEEK_API_KEY`：DeepSeek 模型凭据，由 Harness 管理。
- `LEGALDESK_MATTER_ROOT`：当前运行允许观察的案件根目录；首期沙箱仍固定为只读。
- `LEGALDESK_DATA_DIR`：SQLite 数据库、案件目录和受管材料文件的本地根目录。

## 验证

```sh
npm test
npm run build:client
npm pack --dry-run
```
