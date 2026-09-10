# LegalDesk 用户手册（0.3 单机版）

## 当前状态

`0.3` 已交付基于 DeepSeek Harness 插件机制的案件管理、材料快照、三个法律 Agent、Legal Run、草稿审核和独立 Client UI。它面向单机、单用户或受控终端部署，不是公共法律咨询网站。

正式投入真实案件前，部署机构仍应完成模型提供方合规审查、终端加密、备份恢复演练、访问控制和律师审核制度。LegalDesk 的人工审核状态不能替代机构自身的执业质量控制。

## 发行版启动

发行包不包含案件、凭据或测试数据库。校验 `SHA256SUMS` 后，将已审核并构建的 DeepSeek Harness 放到发行目录的 `deepseek-harness/`，或设置 `DEEPSEEK_HARNESS_DIR`，然后运行：

```sh
node legaldesk.mjs --setup-only
node legaldesk.mjs --no-open --port 3100
```

浏览器访问 `http://127.0.0.1:3100/`。不要把本地服务端口直接暴露到公网。默认数据保存在操作系统用户目录下的 LegalDesk 专用目录，可通过 `LEGALDESK_HOME` 或 `LEGALDESK_DATA_DIR` 调整。

## 源码开发启动

```sh
npm test
npm run dsh:setup
npm run dsh:dump
npm run dsh:dev
```

启动器使用独立的本地 Harness Profile，并强制加载最终安全 overlay。模型凭据由 Harness 设置与凭据服务管理，不写入 LegalDesk 前端状态或仓库文件。

## 用户流程

1. 创建或进入案件。
2. 导入材料并核对案件归属。
3. 选择材料整理、证据审阅或文书起草 Agent。
4. 明确选择本次材料并填写具体任务。
5. 检查模型提供方、联网状态和数据范围。
6. 运行 Agent，并在运行记录中核对关联的 Harness Session。
7. 对待审核草稿填写审核意见，批准或退回。

所有 Agent 产物都可能遗漏事实或产生错误，必须回到原始材料核验。系统不会自动把草稿变成正式法律文件，也不会自动发送或提交。

## 数据边界

- 案件数据和运行记录默认保存在本机。
- 只有本次明确选择且经校验的材料快照可以进入模型请求。
- 使用外部模型时，选定内容可能发送给模型提供方。
- 不同客户或案件的材料不得放入同一案件工作区。

## 安全问题

发现越权读取、工具执行、跨案件混入或敏感数据泄漏时，应立即停止处理，不要在公开 Issue 中粘贴材料、个人信息或密钥，并按 [SECURITY.md](../SECURITY.md) 私下报告。

## 备份与升级

升级前停止 LegalDesk，完整备份 `LEGALDESK_DATA_DIR`。当前版本尚未内置图形化备份恢复入口；机构上线前必须自行验证文件级备份可以恢复 SQLite 数据库和受管材料目录。不要只备份数据库文件而遗漏材料目录。
