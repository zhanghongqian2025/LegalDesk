# LegalDesk

桌面级法律工作平台：以案件和卷宗为中心，让法律工作者在本地完成材料整理、证据审阅与文书起草，并通过受控的智能体协作提升效率。

> 当前处于 `0.2.0` 开发阶段。智能体输出只作为工作草稿和审阅线索，不能替代律师的专业判断；任何对外提交、签署或发送的内容都必须由有权限的人员最终审核。

## 产品定位

LegalDesk 面向律师、公司法务与法律服务团队，采用 Tauri 桌面壳、React 工作台、Rust 本地服务和 SQLite 数据库。默认本地优先，也可在机构网络和合规基础设施中私有部署。

- 案件、卷宗与智能体运行记录由桌面应用统一管理。
- 默认不把案件材料上传到 LegalDesk 自建云端；模型服务是否联网及数据流向取决于用户配置的 Pi 模型提供方。
- LegalDesk 只读取用户选中的受管文本材料并生成受限快照；Pi 首期以零工具模式运行，不能自行访问文件、shell 或任意目录。
- 每份智能体产物先进入“待人工审核”状态，人工确认后才能进入正式工作成果。

## 首期智能体

| 智能体 | 输入 | 产物 |
|---|---|---|
| 材料整理智能体 | 用户选定的案件文件 | 文件分类建议、材料缺口和待核验项 |
| 证据审阅智能体 | 用户选定的证据材料 | 真实性、合法性、关联性审阅线索及风险提示 |
| 文书起草智能体 | 案件信息、用户指令和选定材料 | 标明待核事实与引用依据的文书草稿 |

## Pi 集成策略

LegalDesk 使用 [Pi](https://github.com/earendil-works/pi) 作为智能体核心，并坚持 **Pi 核心零 fork**：不复制或修改上游核心代码，只通过 Pi 的 RPC/SDK 能力建立薄适配层。这样可以让法律领域能力留在 LegalDesk 的智能体定义、提示词、审计和权限边界中，减少二次开发和长期合并成本。

当前集成精确锁定 `@earendil-works/pi-coding-agent@0.84.1`。开发版暂不自动下载或静默安装 Pi；需要用户显式安装这个版本，并由 LegalDesk 在运行前检查版本。详细说明见 [Pi 集成设计](./docs/PI_INTEGRATION.md)。

## 本地开发

### 环境要求

- Node.js 20+
- npm 10+
- Rust 1.85+
- Tauri 2 支持的系统依赖
- 可选：需要运行智能体时，显式安装 Pi `0.84.1`

```bash
git clone https://github.com/zhanghongqian2025/LegalDesk.git
cd LegalDesk

# 禁止依赖生命周期脚本，降低供应链风险
npm ci --ignore-scripts

# 前端构建
npm run build

# Rust 检查
cargo check --manifest-path src-tauri/Cargo.toml
cargo test --manifest-path src-tauri/Cargo.toml

# 桌面开发模式
npm run tauri dev
```

不要在未审阅 `package.json` 和锁文件的情况下移除 `--ignore-scripts`。安全报告和供应链规则见 [SECURITY.md](./SECURITY.md)。

## 项目结构

```text
LegalDesk/
├── src/                    # React 工作台与智能体 UI
├── src-tauri/              # Rust/Tauri、本地数据库与 Pi 进程适配
├── docs/
│   ├── PRODUCT.md          # 产品范围与路线
│   ├── TECHNICAL.md        # 技术架构
│   ├── PI_INTEGRATION.md   # Pi 适配、安全边界与升级策略
│   └── USER_MANUAL.md      # 用户操作说明
├── SPEC.md                 # MVP 验收规格
└── .github/workflows/ci.yml
```

## 文档

- [产品规格](./docs/PRODUCT.md)
- [技术规格](./docs/TECHNICAL.md)
- [Pi 集成设计](./docs/PI_INTEGRATION.md)
- [用户手册](./docs/USER_MANUAL.md)
- [安全政策](./SECURITY.md)

## 状态说明

仓库当前版本用于验证桌面案件工作台与 Pi 最小集成闭环。团队协作、机构级身份权限、静态加密、完整法律检索和正式生产发布仍属于后续工作，不应从界面原型推断为已经完成。

## 许可证

LegalDesk 采用 [MIT License](./LICENSE)。Pi 也是 MIT 许可的软件，相关声明见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。
