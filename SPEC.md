# LegalDesk - 法律工作者 AI 助手

## 1. 项目概述

**项目名称**: LegalDesk  
**类型**: 本地桌面应用（Tauri + React）  
**目标用户**: 律师、法务、法官、检察官、法律学者等法律工作者

## 2. 核心功能

### 2.1 案件管理
- 创建/编辑/删除案件
- 案件分类：民事、刑事、行政、仲裁、非诉
- 案件状态：待处理、办理中、已结案、已归档
- 案件期限管理（诉讼时效、开庭日期、举证期限等）
- 案件搜索与过滤

### 2.2 卷宗整理
- 支持格式：PDF、Word(.doc/.docx)、图片(.jpg/.png/.jpeg)、文本(.txt)
- 文件夹式管理：证据材料、法律文书、庭审记录、往来函件
- 文件标签与备注
- 全文搜索（基于文件内容）

### 2.3 法律文书起草
- AI 辅助文书生成
- 用户自定义模板管理
- 支持的文书类型：起诉状、答辩状、代理词、辩护词、法律意见书、合同等
- 文书版本历史

### 2.4 证据审核
- 证据清单自动生成
- 证据三性分析：真实性、合法性、关联性
- 证据链分析
- 证据可视化（关系图谱）

## 3. 技术架构

### 3.1 技术栈
- **框架**: Tauri 2.x
- **前端**: React 18 + TypeScript + Tailwind CSS
- **状态管理**: Zustand
- **本地数据库**: SQLite (via rusqlite)
- **文件存储**: 本地文件系统
- **AI 集成**: OpenAI API / Claude API / 本地模型

### 3.2 数据结构

```
~/.legaldesk/
├── config.json          # 应用配置
├── database/
│   └── legaldesk.db     # SQLite 数据库
├── cases/               # 案件文件存储
│   └── {case_id}/
│       ├── evidence/    # 证据材料
│       ├── documents/   # 法律文书
│       ├── records/     # 庭审记录
│       └── letters/    # 往来函件
└── templates/          # 用户自定义模板
```

### 3.3 数据库 Schema

```sql
-- 案件表
CREATE TABLE cases (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    case_number TEXT,
    case_type TEXT, -- civil, criminal, administrative, arbitration, non_litigation
    status TEXT, -- pending, in_progress, closed, archived
    court TEXT,
    opposite_party TEXT,
    handler TEXT,
    filing_date TEXT,
    court_date TEXT,
    deadline TEXT,
    description TEXT,
    tags TEXT,
    created_at TEXT,
    updated_at TEXT
);

-- 卷宗文件表
CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    category TEXT, -- evidence, document, record, letter
    filename TEXT NOT NULL,
    filepath TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    tags TEXT,
    notes TEXT,
    created_at TEXT,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);

-- 法律文书表
CREATE TABLE legal_documents (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    doc_type TEXT, -- complaint, answer, brief, opinion, contract, etc.
    title TEXT NOT NULL,
    content TEXT,
    template_id TEXT,
    version INTEGER DEFAULT 1,
    created_at TEXT,
    updated_at TEXT,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);

-- 证据表
CREATE TABLE evidence (
    id TEXT PRIMARY KEY,
    case_id TEXT NOT NULL,
    doc_id TEXT,
    evidence_name TEXT,
    evidence_type TEXT, -- physical, documentary, testimonial, circumstantial
    authenticity TEXT, -- verified, unverified, disputed
    legality TEXT, -- legal, illegal, questionable
    relevance TEXT, -- relevant, irrelevant, questionable
    analysis TEXT,
    created_at TEXT,
    FOREIGN KEY (case_id) REFERENCES cases(id)
);

-- 模板表
CREATE TABLE templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    content TEXT NOT NULL,
    variables TEXT, -- JSON array of variable names
    created_at TEXT,
    updated_at TEXT
);
```

## 4. 界面设计

### 4.1 布局
- 左侧：案件列表导航
- 中间：主工作区（案件详情/卷宗/文书）
- 右侧：AI 助手面板（可选）

### 4.2 主要页面
1. **仪表盘**: 近期案件、待办事项、期限提醒
2. **案件列表**: 所有案件卡片视图
3. **案件详情**: 案件信息、卷宗文件、文书列表
4. **卷宗管理**: 文件上传、分类、预览
5. **文书起草**: 编辑器 + AI 辅助
6. **证据审核**: 证据清单 + 三性分析
7. **设置**: AI 配置、存储路径、数据备份

## 5. AI 功能设计

### 5.1 文书起草
- 用户输入关键信息（当事人、诉求、事实）
- AI 生成初稿
- 用户编辑完善
- 版本保存

### 5.2 证据分析
- 上传证据材料
- AI 分析证据三性
- 生成证据清单

### 5.3 法律检索
- 关键词检索相关法条
- 案例参考

## 6. 安全性

- 本地数据加密存储（可选）
- 敏感操作日志
- 定期自动备份

## 7. 发展阶段

### Phase 1: MVP
- [x] 项目初始化
- [ ] 案件 CRUD
- [ ] 基础文件管理
- [ ] 简单 AI 对话

### Phase 2: 核心功能
- [ ] 法律文书起草
- [ ] 证据审核
- [ ] 模板管理

### Phase 3: 增强功能
- [ ] 法律检索
- [ ] 多语言支持
- [ ] 数据同步
