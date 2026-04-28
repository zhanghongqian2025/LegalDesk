use rusqlite::{Connection, Result as SqliteResult};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::State;
use uuid::Uuid;
use chrono::Utc;

// 数据库状态
pub struct DbState(pub Mutex<Connection>);

// 数据模型
#[derive(Debug, Serialize, Deserialize, Clone)]
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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CreateCaseInput {
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
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Document {
    pub id: String,
    pub case_id: String,
    pub category: String,
    pub filename: String,
    pub filepath: String,
    pub file_type: Option<String>,
    pub file_size: Option<i64>,
    pub tags: Option<String>,
    pub notes: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LegalDocument {
    pub id: String,
    pub case_id: String,
    pub doc_type: Option<String>,
    pub title: String,
    pub content: Option<String>,
    pub template_id: Option<String>,
    pub version: i32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Evidence {
    pub id: String,
    pub case_id: String,
    pub doc_id: Option<String>,
    pub evidence_name: String,
    pub evidence_type: Option<String>,
    pub authenticity: Option<String>,
    pub legality: Option<String>,
    pub relevance: Option<String>,
    pub analysis: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Template {
    pub id: String,
    pub name: String,
    pub category: Option<String>,
    pub content: String,
    pub variables: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

// 初始化数据库
fn init_database(conn: &Connection) -> SqliteResult<()> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS cases (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            case_number TEXT,
            case_type TEXT NOT NULL,
            status TEXT NOT NULL,
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
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            case_id TEXT NOT NULL,
            category TEXT NOT NULL,
            filename TEXT NOT NULL,
            filepath TEXT NOT NULL,
            file_type TEXT,
            file_size INTEGER,
            tags TEXT,
            notes TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS legal_documents (
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
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS evidence (
            id TEXT PRIMARY KEY,
            case_id TEXT NOT NULL,
            doc_id TEXT,
            evidence_name TEXT NOT NULL,
            evidence_type TEXT,
            authenticity TEXT,
            legality TEXT,
            relevance TEXT,
            analysis TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS templates (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            category TEXT,
            content TEXT NOT NULL,
            variables TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    )?;

    Ok(())
}

// 获取应用数据目录
fn get_data_dir() -> PathBuf {
    dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("LegalDesk")
}

// 获取案件目录
fn get_case_dir(case_id: &str) -> PathBuf {
    get_data_dir().join("cases").join(case_id)
}

// 确保案件目录存在
fn ensure_case_dir(case_id: &str) -> Result<PathBuf, String> {
    let case_dir = get_case_dir(case_id);
    fs::create_dir_all(&case_dir).map_err(|e| format!("创建案件目录失败: {}", e))?;
    Ok(case_dir)
}

// 案件管理命令
#[tauri::command]
fn get_cases(db: State<DbState>) -> Result<Vec<Case>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT * FROM cases ORDER BY updated_at DESC")
        .map_err(|e| e.to_string())?;

    let cases = stmt
        .query_map([], |row| {
            Ok(Case {
                id: row.get(0)?,
                title: row.get(1)?,
                case_number: row.get(2)?,
                case_type: row.get(3)?,
                status: row.get(4)?,
                court: row.get(5)?,
                opposite_party: row.get(6)?,
                handler: row.get(7)?,
                filing_date: row.get(8)?,
                court_date: row.get(9)?,
                deadline: row.get(10)?,
                description: row.get(11)?,
                tags: row.get(12)?,
                created_at: row.get(13)?,
                updated_at: row.get(14)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(cases)
}

#[tauri::command]
fn get_case(db: State<DbState>, id: String) -> Result<Option<Case>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT * FROM cases WHERE id = ?")
        .map_err(|e| e.to_string())?;

    let case = stmt
        .query_row([&id], |row| {
            Ok(Case {
                id: row.get(0)?,
                title: row.get(1)?,
                case_number: row.get(2)?,
                case_type: row.get(3)?,
                status: row.get(4)?,
                court: row.get(5)?,
                opposite_party: row.get(6)?,
                handler: row.get(7)?,
                filing_date: row.get(8)?,
                court_date: row.get(9)?,
                deadline: row.get(10)?,
                description: row.get(11)?,
                tags: row.get(12)?,
                created_at: row.get(13)?,
                updated_at: row.get(14)?,
            })
        })
        .ok();

    Ok(case)
}

#[tauri::command]
fn create_case(db: State<DbState>, input: CreateCaseInput) -> Result<Case, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    // 创建案件目录
    drop(conn);
    ensure_case_dir(&id)?;
    let conn = db.0.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO cases (id, title, case_number, case_type, status, court, opposite_party, handler, filing_date, court_date, deadline, description, tags, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params![
            &id,
            &input.title,
            &input.case_number,
            &input.case_type,
            &input.status,
            &input.court,
            &input.opposite_party,
            &input.handler,
            &input.filing_date,
            &input.court_date,
            &input.deadline,
            &input.description,
            &input.tags,
            &now,
            &now,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(Case {
        id,
        title: input.title,
        case_number: input.case_number,
        case_type: input.case_type,
        status: input.status,
        court: input.court,
        opposite_party: input.opposite_party,
        handler: input.handler,
        filing_date: input.filing_date,
        court_date: input.court_date,
        deadline: input.deadline,
        description: input.description,
        tags: input.tags,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
fn update_case(db: State<DbState>, id: String, input: CreateCaseInput) -> Result<Case, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "UPDATE cases SET title = ?, case_number = ?, case_type = ?, status = ?, court = ?, opposite_party = ?, handler = ?, filing_date = ?, court_date = ?, deadline = ?, description = ?, tags = ?, updated_at = ? WHERE id = ?",
        rusqlite::params![
            &input.title,
            &input.case_number,
            &input.case_type,
            &input.status,
            &input.court,
            &input.opposite_party,
            &input.handler,
            &input.filing_date,
            &input.court_date,
            &input.deadline,
            &input.description,
            &input.tags,
            &now,
            &id,
        ],
    )
    .map_err(|e| e.to_string())?;

    let created_at: String = conn
        .query_row("SELECT created_at FROM cases WHERE id = ?", [&id], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    Ok(Case {
        id,
        title: input.title,
        case_number: input.case_number,
        case_type: input.case_type,
        status: input.status,
        court: input.court,
        opposite_party: input.opposite_party,
        handler: input.handler,
        filing_date: input.filing_date,
        court_date: input.court_date,
        deadline: input.deadline,
        description: input.description,
        tags: input.tags,
        created_at,
        updated_at: now,
    })
}

#[tauri::command]
fn delete_case(db: State<DbState>, id: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    // 删除案件目录
    let case_dir = get_case_dir(&id);
    if case_dir.exists() {
        let _ = fs::remove_dir_all(&case_dir);
    }
    
    conn.execute("DELETE FROM cases WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// 文档管理命令
#[tauri::command]
fn get_documents(db: State<DbState>, case_id: String) -> Result<Vec<Document>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT * FROM documents WHERE case_id = ? ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;

    let docs = stmt
        .query_map([&case_id], |row| {
            Ok(Document {
                id: row.get(0)?,
                case_id: row.get(1)?,
                category: row.get(2)?,
                filename: row.get(3)?,
                filepath: row.get(4)?,
                file_type: row.get(5)?,
                file_size: row.get(6)?,
                tags: row.get(7)?,
                notes: row.get(8)?,
                created_at: row.get(9)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(docs)
}

/// 导入文件到案件目录（复制文件到应用数据目录）
/// 解决原文件移动后链接失效的问题
#[tauri::command]
fn import_file_to_case(
    db: State<DbState>,
    case_id: String,
    source_path: String,
    category: String,
) -> Result<Document, String> {
    // 确保案件目录存在
    ensure_case_dir(&case_id)?;
    
    // 验证源文件存在
    let source = PathBuf::from(&source_path);
    if !source.exists() {
        return Err(format!("源文件不存在: {}", source_path));
    }
    
    // 获取文件名
    let filename = source
        .file_name()
        .and_then(|n| n.to_str())
        .ok_or("无法获取文件名")?;
    
    // 生成唯一文件名（防止重名覆盖）
    let ext = source.extension().and_then(|e| e.to_str()).unwrap_or("");
    let stem = source.file_stem().and_then(|s| s.to_str()).unwrap_or(filename);
    let unique_filename = if ext.is_empty() {
        format!("{}_{}", stem, &Uuid::new_v4().to_string()[..8])
    } else {
        format!("{}_{}.{}", stem, &Uuid::new_v4().to_string()[..8], ext)
    };
    
    // 目标路径
    let case_dir = get_case_dir(&case_id);
    let dest_path = case_dir.join(&unique_filename);
    
    // 复制文件
    fs::copy(&source, &dest_path).map_err(|e| format!("文件复制失败: {}", e))?;
    
    // 获取文件大小
    let file_size = fs::metadata(&dest_path)
        .map(|m| m.len() as i64)
        .ok();
    
    // 获取文件扩展名
    let file_type = if ext.is_empty() { None } else { Some(ext.to_lowercase()) };
    
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO documents (id, case_id, category, filename, filepath, file_type, file_size, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params![&id, &case_id, &category, &filename, &dest_path.to_string_lossy().to_string(), &file_type, &file_size, &now],
    )
    .map_err(|e| e.to_string())?;

    Ok(Document {
        id,
        case_id,
        category,
        filename: filename.to_string(),
        filepath: dest_path.to_string_lossy().to_string(),
        file_type,
        file_size,
        tags: None,
        notes: None,
        created_at: now,
    })
}

#[tauri::command]
fn add_document(
    db: State<DbState>,
    case_id: String,
    category: String,
    filename: String,
    filepath: String,
    file_type: Option<String>,
    file_size: Option<i64>,
) -> Result<Document, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO documents (id, case_id, category, filename, filepath, file_type, file_size, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params![&id, &case_id, &category, &filename, &filepath, &file_type, &file_size, &now],
    )
    .map_err(|e| e.to_string())?;

    Ok(Document {
        id,
        case_id,
        category,
        filename,
        filepath,
        file_type,
        file_size,
        tags: None,
        notes: None,
        created_at: now,
    })
}

#[tauri::command]
fn delete_document(db: State<DbState>, id: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    
    // 获取文件路径并删除文件
    if let Ok(filepath) = conn.query_row(
        "SELECT filepath FROM documents WHERE id = ?",
        [&id],
        |row| row.get::<_, String>(0),
    ) {
        let path = PathBuf::from(&filepath);
        if path.exists() {
            let _ = fs::remove_file(path);
        }
    }
    
    conn.execute("DELETE FROM documents WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// 法律文书命令
#[tauri::command]
fn get_legal_documents(db: State<DbState>, case_id: String) -> Result<Vec<LegalDocument>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT * FROM legal_documents WHERE case_id = ? ORDER BY updated_at DESC")
        .map_err(|e| e.to_string())?;

    let docs = stmt
        .query_map([&case_id], |row| {
            Ok(LegalDocument {
                id: row.get(0)?,
                case_id: row.get(1)?,
                doc_type: row.get(2)?,
                title: row.get(3)?,
                content: row.get(4)?,
                template_id: row.get(5)?,
                version: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(docs)
}

#[tauri::command]
fn save_legal_document(
    db: State<DbState>,
    case_id: String,
    doc_type: Option<String>,
    title: String,
    content: Option<String>,
    id: Option<String>,
) -> Result<LegalDocument, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();

    if let Some(existing_id) = id {
        conn.execute(
            "UPDATE legal_documents SET doc_type = ?, title = ?, content = ?, updated_at = ? WHERE id = ?",
            rusqlite::params![&doc_type, &title, &content, &now, &existing_id],
        )
        .map_err(|e| e.to_string())?;

        let created_at: String = conn
            .query_row("SELECT created_at FROM legal_documents WHERE id = ?", [&existing_id], |row| row.get(0))
            .map_err(|e| e.to_string())?;

        Ok(LegalDocument {
            id: existing_id,
            case_id,
            doc_type,
            title,
            content,
            template_id: None,
            version: 1,
            created_at,
            updated_at: now,
        })
    } else {
        let new_id = Uuid::new_v4().to_string();
        conn.execute(
            "INSERT INTO legal_documents (id, case_id, doc_type, title, content, version, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, ?, ?)",
            rusqlite::params![&new_id, &case_id, &doc_type, &title, &content, &now, &now],
        )
        .map_err(|e| e.to_string())?;

        Ok(LegalDocument {
            id: new_id,
            case_id,
            doc_type,
            title,
            content,
            template_id: None,
            version: 1,
            created_at: now.clone(),
            updated_at: now,
        })
    }
}

#[tauri::command]
fn delete_legal_document(db: State<DbState>, id: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM legal_documents WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// 证据管理命令
#[tauri::command]
fn get_evidence(db: State<DbState>, case_id: String) -> Result<Vec<Evidence>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT * FROM evidence WHERE case_id = ? ORDER BY created_at DESC")
        .map_err(|e| e.to_string())?;

    let evidence = stmt
        .query_map([&case_id], |row| {
            Ok(Evidence {
                id: row.get(0)?,
                case_id: row.get(1)?,
                doc_id: row.get(2)?,
                evidence_name: row.get(3)?,
                evidence_type: row.get(4)?,
                authenticity: row.get(5)?,
                legality: row.get(6)?,
                relevance: row.get(7)?,
                analysis: row.get(8)?,
                created_at: row.get(9)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(evidence)
}

#[tauri::command]
fn add_evidence(
    db: State<DbState>,
    case_id: String,
    evidence_name: String,
    doc_id: Option<String>,
    evidence_type: Option<String>,
    authenticity: Option<String>,
    legality: Option<String>,
    relevance: Option<String>,
    analysis: Option<String>,
) -> Result<Evidence, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO evidence (id, case_id, doc_id, evidence_name, evidence_type, authenticity, legality, relevance, analysis, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params![&id, &case_id, &doc_id, &evidence_name, &evidence_type, &authenticity, &legality, &relevance, &analysis, &now],
    )
    .map_err(|e| e.to_string())?;

    Ok(Evidence {
        id,
        case_id,
        doc_id,
        evidence_name,
        evidence_type,
        authenticity,
        legality,
        relevance,
        analysis,
        created_at: now,
    })
}

#[tauri::command]
fn update_evidence(
    db: State<DbState>,
    id: String,
    evidence_name: String,
    evidence_type: Option<String>,
    authenticity: Option<String>,
    legality: Option<String>,
    relevance: Option<String>,
    analysis: Option<String>,
) -> Result<Evidence, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;

    let case_id: String = conn
        .query_row("SELECT case_id FROM evidence WHERE id = ?", [&id], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    let created_at: String = conn
        .query_row("SELECT created_at FROM evidence WHERE id = ?", [&id], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE evidence SET evidence_name = ?, evidence_type = ?, authenticity = ?, legality = ?, relevance = ?, analysis = ? WHERE id = ?",
        rusqlite::params![&evidence_name, &evidence_type, &authenticity, &legality, &relevance, &analysis, &id],
    )
    .map_err(|e| e.to_string())?;

    Ok(Evidence {
        id,
        case_id,
        doc_id: None,
        evidence_name,
        evidence_type,
        authenticity,
        legality,
        relevance,
        analysis,
        created_at,
    })
}

#[tauri::command]
fn delete_evidence(db: State<DbState>, id: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM evidence WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// 模板管理命令
#[tauri::command]
fn get_templates(db: State<DbState>) -> Result<Vec<Template>, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare("SELECT * FROM templates ORDER BY name")
        .map_err(|e| e.to_string())?;

    let templates = stmt
        .query_map([], |row| {
            Ok(Template {
                id: row.get(0)?,
                name: row.get(1)?,
                category: row.get(2)?,
                content: row.get(3)?,
                variables: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(templates)
}

#[tauri::command]
fn save_template(
    db: State<DbState>,
    name: String,
    category: Option<String>,
    content: String,
    variables: Option<String>,
    id: Option<String>,
) -> Result<Template, String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();

    if let Some(existing_id) = id {
        conn.execute(
            "UPDATE templates SET name = ?, category = ?, content = ?, variables = ?, updated_at = ? WHERE id = ?",
            rusqlite::params![&name, &category, &content, &variables, &now, &existing_id],
        )
        .map_err(|e| e.to_string())?;

        let created_at: String = conn
            .query_row("SELECT created_at FROM templates WHERE id = ?", [&existing_id], |row| row.get(0))
            .map_err(|e| e.to_string())?;

        Ok(Template {
            id: existing_id,
            name,
            category,
            content,
            variables,
            created_at,
            updated_at: now,
        })
    } else {
        let new_id = Uuid::new_v4().to_string();
        conn.execute(
            "INSERT INTO templates (id, name, category, content, variables, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![&new_id, &name, &category, &content, &variables, &now, &now],
        )
        .map_err(|e| e.to_string())?;

        Ok(Template {
            id: new_id,
            name,
            category,
            content,
            variables,
            created_at: now.clone(),
            updated_at: now,
        })
    }
}

#[tauri::command]
fn delete_template(db: State<DbState>, id: String) -> Result<(), String> {
    let conn = db.0.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM templates WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// 获取应用数据目录
#[tauri::command]
fn get_app_data_dir() -> Result<String, String> {
    let data_dir = get_data_dir();
    fs::create_dir_all(&data_dir).map_err(|e| e.to_string())?;
    Ok(data_dir.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 初始化日志
    env_logger::init();

    // 获取数据目录
    let data_dir = get_data_dir();
    fs::create_dir_all(&data_dir).expect("Failed to create data directory");

    // 初始化数据库
    let db_path = data_dir.join("legaldesk.db");
    let conn = Connection::open(&db_path).expect("Failed to open database");
    init_database(&conn).expect("Failed to initialize database");

    // 创建案件文件夹
    let cases_dir = data_dir.join("cases");
    fs::create_dir_all(&cases_dir).expect("Failed to create cases directory");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .manage(DbState(Mutex::new(conn)))
        .invoke_handler(tauri::generate_handler![
            get_cases,
            get_case,
            create_case,
            update_case,
            delete_case,
            get_documents,
            add_document,
            delete_document,
            get_legal_documents,
            save_legal_document,
            delete_legal_document,
            get_evidence,
            add_evidence,
            update_evidence,
            delete_evidence,
            get_templates,
            save_template,
            delete_template,
            get_app_data_dir,
            import_file_to_case,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
