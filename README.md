# LegalDesk

🦅 法律工作者 AI 助手

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-green.svg)](./SPEC.md)

## 简介

LegalDesk 是一款专为法律工作者设计的本地桌面 AI 助手应用，采用 Tauri + React 技术栈开发，帮助律师、法务等法律从业者高效管理案件、整理卷宗、起草法律文书、审核证据。

## 主要功能

- 📤 **智能上传** - 上传法律文件，AI 自动分析案件信息
- 📁 **案件管理** - 创建、编辑、删除案件，支持分类筛选
- 📄 **卷宗整理** - 上传和管理案件相关文件
- 📝 **法律文书** - 起草、编辑法律文书，支持模板
- 🔍 **证据审核** - 证据三性分析（真实性、合法性、关联性）
- 🤖 **AI 助手** - 智能对话，辅助法律工作
- 📋 **模板管理** - 自定义文书模板

## 技术栈

- **框架**: Tauri 2.x
- **前端**: React 18 + TypeScript
- **样式**: Tailwind CSS
- **状态**: Zustand
- **后端**: Rust
- **数据库**: SQLite

## 快速开始

### 环境要求

- Node.js 18+
- Rust 1.70+
- macOS 11.0+

### 安装

```bash
# 克隆项目
git clone https://github.com/your-repo/LegalDesk.git
cd LegalDesk

# 安装依赖
npm install

# 启动开发模式
npm run tauri dev
```

### 构建

```bash
# 构建生产版本
npm run tauri build
```

构建产物位于 `src-tauri/target/release/bundle/` 目录。

## 文档

- [📖 用户手册](./docs/USER_MANUAL.md) - 详细使用说明
- [🔧 技术文档](./docs/TECHNICAL.md) - 开发者技术规格
- [📋 产品规格](./docs/PRODUCT.md) - 产品功能定义

## 项目结构

```
LegalDesk/
├── src/                  # React 前端
│   ├── pages/           # 页面组件
│   ├── store/           # 状态管理
│   └── types/           # 类型定义
├── src-tauri/           # Rust 后端
│   ├── src/
│   │   └── lib.rs      # 核心逻辑
│   └── Cargo.toml       # 依赖配置
├── docs/                # 文档
│   ├── USER_MANUAL.md  # 用户手册
│   ├── TECHNICAL.md    # 技术文档
│   └── PRODUCT.md       # 产品规格
└── package.json
```

## 数据存储

所有数据存储在本地：
- 数据库: `~/.legaldesk/legaldesk.db`
- 文件: `~/.legaldesk/cases/`

## 版本

当前版本: **v0.1.0**

详见 [CHANGELOG](./CHANGELOG.md)

## 许可证

MIT License - 详见 [LICENSE](./LICENSE)

## 联系方式

- 反馈: feedback@legaldesk.app
- 支持: support@legaldesk.app

---

*LegalDesk - 让法律工作更高效*
