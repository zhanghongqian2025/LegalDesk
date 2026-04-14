# LegalDesk 技术规格说明书

## 1. 项目概述

### 1.1 项目简介
**LegalDesk** 是一款面向法律工作者的本地桌面 AI 助手应用，采用 Tauri 2.x + React 18 技术栈开发，支持案件管理、卷宗整理、法律文书起草、证据审核等核心功能。

### 1.2 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────┐   │
│  │ Zustand │  │ Tailwind │  │ Lucide  │  │ Tauri API   │   │
│  └─────────┘  └─────────┘  └─────────┘  └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                    Tauri IPC (invoke)
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Backend (Rust)                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────┐   │
│  │ SQLite  │  │  File   │  │  AI     │  │  Plugins   │   │
│  │(rusqlite)│  │ System  │  │ Integration│ │ (fs,dialog)│   │
│  └─────────┘  └─────────┘  └─────────┘  └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 框架 | Tauri | 2.x |
| 前端框架 | React | 18.x |
| 语言 | TypeScript | 5.x |
| 构建工具 | Vite | 7.x |
| 状态管理 | Zustand | 4.x |
| 样式 | Tailwind CSS | 3.x |
| 后端语言 | Rust | 1.94 |
| 数据库 | SQLite (rusqlite) | 0.32 |

### 1.4 项目结构

```
LegalDesk/
├── src/                      # React 前端源码
│   ├── components/           # 可复用组件
│   ├── pages/                # 页面组件
│   │   ├── CaseList.tsx     # 案件列表页
│   │   ├── CaseDetail.tsx   # 案件详情页
│   │   └── TemplatePage.tsx # 模板管理页
│   ├── store/               # Zustand 状态管理
│   │   └── index.ts         # 全局状态
│   ├── types/               # TypeScript 类型定义
│   │   └── index.ts         # 接口定义
│   ├── App.tsx              # 主应用组件
│   ├── App.css              # 全局样式
│   └── main.tsx             # 入口文件
│
├── src-tauri/               # Rust 后端源码
│   ├── src/
│   │   └── lib.rs           # 主逻辑 + Tauri 命令
│   ├── Cargo.toml           # Rust 依赖配置
│   ├── tauri.conf.json      # Tauri 配置
│   └── icons/               # 应用图标
│
├── dist/                    # 前端构建产物
├── SPEC.md                  # 产品规格文档
├── README.md               # 项目说明
└── package.json            # Node 依赖配置
```

---

## 2. 数据模型

### 2.1 数据库表结构

```sql
-- 案件表
CREATE TABLE cases (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    case_number TEXT,
    case_type TEXT NOT NULL,      -- civil/criminal/administrative/arbitration/non_litigation
    status TEXT NOT NULL,         -- pending/in_progress/closed/archived
    court TEXT,
    opposite_party TEXT,
    handler TEXT,
    filing_date TEXT,
    court_date TEXT,
    deadline TEXT,
    description TEXT,
    tags TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 卷宗文件表
CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    category TEXT NOT NULL,       -- evidence/document/record/letter
    filename TEXT NOT NULL,
    filepath TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    tags TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- 法律文书表
CREATE TABLE legal_documents (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    doc_type TEXT,
    title TEXT NOT NULL,
    content TEXT,
    template_id TEXT,
    version INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- 证据表
CREATE TABLE evidence (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    doc_id TEXT,
    evidence_name TEXT NOT NULL,
    evidence_type TEXT,            -- physical/documentary/testimonial/circumstantial
    authenticity TEXT,             -- verified/unverified/disputed
    legality TEXT,                 -- legal/illegal/questionable
    relevance TEXT,                -- relevant/irrelevant/questionable
    analysis TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

-- 模板表
CREATE TABLE templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    content TEXT NOT NULL,
    variables TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

### 2.2 Rust 数据结构

```rust
// 案件结构
pub struct Case {
    pub id: String,
    pub title: String,
    pub case_number: Option<String>,
    pub case_type: String,
    pub status: String,
    pub court: Option<String>,
    pub opposite_party: Option<String>,
    pub handler: Option<String>,
    pub filing_date: Option<String>,
    pub court_date: Option<String>,
    pub deadline: Option<String>,
    pub description: Option<String>,
    pub tags: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}
```

---

## 3. Tauri 命令接口

### 3.1 案件管理

| 命令 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `get_cases` | - | `Vec<Case>` | 获取所有案件 |
| `get_case` | `id: String` | `Option<Case>` | 获取单个案件 |
| `create_case` | `input: CreateCaseInput` | `Case` | 创建案件 |
| `update_case` | `id: String, input: CreateCaseInput` | `Case` | 更新案件 |
| `delete_case` | `id: String` | `()` | 删除案件 |

### 3.2 文档管理

| 命令 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `get_documents` | `case_id: String` | `Vec<Document>` | 获取案件文档 |
| `add_document` | `case_id, category, filename, filepath, ...` | `Document` | 添加文档 |
| `delete_document` | `id: String` | `()` | 删除文档 |

### 3.3 法律文书

| 命令 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `get_legal_documents` | `case_id: String` | `Vec<LegalDocument>` | 获取文书列表 |
| `save_legal_document` | `case_id, title, content, id?` | `LegalDocument` | 保存文书 |
| `delete_legal_document` | `id: String` | `()` | 删除文书 |

### 3.4 证据管理

| 命令 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `get_evidence` | `case_id: String` | `Vec<Evidence>` | 获取证据列表 |
| `add_evidence` | `case_id, evidence_name, ...` | `Evidence` | 添加证据 |
| `update_evidence` | `id, evidence_name, ...` | `Evidence` | 更新证据 |
| `delete_evidence` | `id: String` | `()` | 删除证据 |

### 3.5 模板管理

| 命令 | 参数 | 返回 | 说明 |
|------|------|------|------|
| `get_templates` | - | `Vec<Template>` | 获取模板列表 |
| `save_template` | `name, category, content, id?` | `Template` | 保存模板 |
| `delete_template` | `id: String` | `()` | 删除模板 |

---

## 4. 前端状态管理

### 4.1 Zustand Store 结构

```typescript
interface AppState {
  // 案件
  cases: Case[];
  selectedCaseId: string | null;
  loading: boolean;
  
  // 当前案件数据
  documents: Document[];
  legalDocuments: LegalDocument[];
  evidence: Evidence[];
  
  // 模板
  templates: Template[];
  
  // AI 对话
  aiMessages: { role: 'user' | 'assistant'; content: string }[];
  
  // Actions
  fetchCases: () => Promise<void>;
  createCase: (input: CreateCaseInput) => Promise<Case>;
  // ... 更多方法
}
```

---

## 5. 构建与部署

### 5.1 开发环境

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run tauri dev
```

### 5.2 生产构建

```bash
# 构建前端
npm run build

# 构建桌面应用
npm run tauri build
```

### 5.3 输出产物

- **macOS 应用**: `src-tauri/target/release/bundle/macos/LegalDesk.app`
- **DMG 安装包**: `src-tauri/target/release/bundle/dmg/LegalDesk_0.1.0_aarch64.dmg`

---

## 6. 数据存储

### 6.1 本地存储路径

```
~/.legaldesk/
├── legaldesk.db     # SQLite 数据库
└── cases/           # 案件文件存储
```

### 6.2 配置

应用配置存储在系统数据目录：`~/Library/Application Support/com.legaldesk.app/`
