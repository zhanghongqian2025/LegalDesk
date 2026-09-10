import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { DatabaseSync } from 'node:sqlite'

export class LegalDeskDatabase {
  constructor(path) {
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 })
    this.db = new DatabaseSync(path)
    this.db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;')
    this.migrate()
  }

  migrate() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS matters (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, reference_no TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL, updated_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS materials (
        id TEXT PRIMARY KEY, matter_id TEXT NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
        name TEXT NOT NULL, media_type TEXT NOT NULL, byte_size INTEGER NOT NULL,
        sha256 TEXT NOT NULL, stored_path TEXT NOT NULL, imported_at TEXT NOT NULL,
        parse_status TEXT NOT NULL DEFAULT 'not_required', parser TEXT NOT NULL DEFAULT '',
        parser_version TEXT NOT NULL DEFAULT '', derived_path TEXT, derived_sha256 TEXT,
        parsed_at TEXT, parse_error TEXT NOT NULL DEFAULT '', page_count INTEGER,
        ocr_used INTEGER NOT NULL DEFAULT 0, parse_elapsed_ms INTEGER
      );
      CREATE TABLE IF NOT EXISTS snapshots (
        id TEXT PRIMARY KEY, matter_id TEXT NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
        label TEXT NOT NULL, manifest_json TEXT NOT NULL, created_at TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS legal_runs (
        id TEXT PRIMARY KEY, matter_id TEXT NOT NULL REFERENCES matters(id) ON DELETE CASCADE,
        snapshot_id TEXT NOT NULL REFERENCES snapshots(id), agent_key TEXT NOT NULL,
        harness_session_id TEXT NOT NULL UNIQUE, status TEXT NOT NULL,
        created_at TEXT NOT NULL, completed_at TEXT, error TEXT,
        provider TEXT NOT NULL DEFAULT '', model TEXT NOT NULL DEFAULT '',
        input_tokens INTEGER NOT NULL DEFAULT 0, cache_read_tokens INTEGER NOT NULL DEFAULT 0,
        cache_write_tokens INTEGER NOT NULL DEFAULT 0, output_tokens INTEGER NOT NULL DEFAULT 0,
        reasoning_tokens INTEGER NOT NULL DEFAULT 0, request_count INTEGER NOT NULL DEFAULT 0,
        estimated_cost_microusd INTEGER, pricing_version TEXT NOT NULL DEFAULT 'unpriced'
      );
      CREATE TABLE IF NOT EXISTS artifacts (
        id TEXT PRIMARY KEY, run_id TEXT NOT NULL REFERENCES legal_runs(id) ON DELETE CASCADE,
        title TEXT NOT NULL, content TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending_review',
        reviewer_note TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL, reviewed_at TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_materials_matter ON materials(matter_id, imported_at);
      CREATE INDEX IF NOT EXISTS idx_runs_matter ON legal_runs(matter_id, created_at);
      CREATE INDEX IF NOT EXISTS idx_artifacts_run ON artifacts(run_id, created_at);
    `)
    this.ensureColumns('materials', {
      parse_status: "TEXT NOT NULL DEFAULT 'not_required'", parser: "TEXT NOT NULL DEFAULT ''",
      parser_version: "TEXT NOT NULL DEFAULT ''", derived_path: 'TEXT', derived_sha256: 'TEXT',
      parsed_at: 'TEXT', parse_error: "TEXT NOT NULL DEFAULT ''", page_count: 'INTEGER',
      ocr_used: 'INTEGER NOT NULL DEFAULT 0', parse_elapsed_ms: 'INTEGER',
    })
    this.ensureColumns('legal_runs', {
      provider: "TEXT NOT NULL DEFAULT ''", model: "TEXT NOT NULL DEFAULT ''",
      input_tokens: 'INTEGER NOT NULL DEFAULT 0', cache_read_tokens: 'INTEGER NOT NULL DEFAULT 0',
      cache_write_tokens: 'INTEGER NOT NULL DEFAULT 0', output_tokens: 'INTEGER NOT NULL DEFAULT 0',
      reasoning_tokens: 'INTEGER NOT NULL DEFAULT 0', request_count: 'INTEGER NOT NULL DEFAULT 0',
      estimated_cost_microusd: 'INTEGER', pricing_version: "TEXT NOT NULL DEFAULT 'unpriced'",
    })
  }

  ensureColumns(table, columns) {
    const existing = new Set(this.db.prepare(`PRAGMA table_info(${table})`).all().map(row => row.name))
    for (const [name, definition] of Object.entries(columns)) {
      if (!existing.has(name)) this.db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`)
    }
  }

  close() { this.db.close() }

  listMatters() {
    return this.db.prepare(`
      SELECT m.*,
        (SELECT count(*) FROM materials x WHERE x.matter_id=m.id) AS material_count,
        (SELECT count(*) FROM legal_runs r WHERE r.matter_id=m.id) AS run_count
      FROM matters m ORDER BY m.updated_at DESC
    `).all()
  }

  createMatter(row) {
    this.db.prepare('INSERT INTO matters (id,title,reference_no,created_at,updated_at) VALUES (?,?,?,?,?)')
      .run(row.id, row.title, row.referenceNo, row.createdAt, row.createdAt)
    return this.getMatter(row.id)
  }

  getMatter(id) {
    return this.db.prepare('SELECT * FROM matters WHERE id=?').get(id)
  }

  addMaterial(row) {
    this.db.prepare(`INSERT INTO materials
      (id,matter_id,name,media_type,byte_size,sha256,stored_path,imported_at,parse_status,parser,parser_version,
       derived_path,derived_sha256,parsed_at,parse_error,page_count,ocr_used,parse_elapsed_ms)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
      .run(row.id, row.matterId, row.name, row.mediaType, row.byteSize, row.sha256, row.storedPath, row.importedAt,
        row.parseStatus, row.parser, row.parserVersion, row.derivedPath, row.derivedSha256, row.parsedAt,
        row.parseError, row.pageCount, row.ocrUsed ? 1 : 0, row.parseElapsedMs)
    this.touch(row.matterId, row.importedAt)
    return this.db.prepare('SELECT * FROM materials WHERE id=?').get(row.id)
  }

  listMaterials(matterId) {
    return this.db.prepare(`SELECT id,matter_id,name,media_type,byte_size,sha256,imported_at,parse_status,parser,
      parser_version,derived_sha256,parsed_at,parse_error,page_count,ocr_used,parse_elapsed_ms
      FROM materials WHERE matter_id=? ORDER BY imported_at DESC`).all(matterId)
  }

  materialRows(matterId, ids) {
    if (ids.length === 0) return []
    const marks = ids.map(() => '?').join(',')
    return this.db.prepare(`SELECT * FROM materials WHERE matter_id=? AND id IN (${marks}) ORDER BY imported_at`).all(matterId, ...ids)
  }

  addSnapshot(row) {
    this.db.prepare('INSERT INTO snapshots (id,matter_id,label,manifest_json,created_at) VALUES (?,?,?,?,?)')
      .run(row.id, row.matterId, row.label, JSON.stringify(row.manifest), row.createdAt)
    this.touch(row.matterId, row.createdAt)
    return row
  }

  getSnapshot(id) {
    const row = this.db.prepare('SELECT * FROM snapshots WHERE id=?').get(id)
    return row === undefined ? undefined : { ...row, manifest: JSON.parse(row.manifest_json) }
  }

  listSnapshots(matterId) {
    return this.db.prepare('SELECT id,matter_id,label,manifest_json,created_at FROM snapshots WHERE matter_id=? ORDER BY created_at DESC').all(matterId)
      .map(row => ({ ...row, material_count: JSON.parse(row.manifest_json).materials.length }))
  }

  addRun(row) {
    this.db.prepare(`INSERT INTO legal_runs
      (id,matter_id,snapshot_id,agent_key,harness_session_id,status,created_at) VALUES (?,?,?,?,?,?,?)`)
      .run(row.id, row.matterId, row.snapshotId, row.agentKey, row.sessionId, row.status, row.createdAt)
    this.touch(row.matterId, row.createdAt)
    return row
  }

  completeRun(id, completedAt, usage) {
    this.db.prepare(`UPDATE legal_runs SET status='completed', completed_at=?, provider=?, model=?, input_tokens=?,
      cache_read_tokens=?, cache_write_tokens=?, output_tokens=?, reasoning_tokens=?, request_count=?,
      estimated_cost_microusd=?, pricing_version=? WHERE id=?`)
      .run(completedAt, usage.provider, usage.model, usage.inputTokens, usage.cacheReadTokens, usage.cacheWriteTokens,
        usage.outputTokens, usage.reasoningTokens, usage.requestCount, usage.estimatedCostMicrousd, usage.pricingVersion, id)
  }

  failRun(id, error, completedAt, usage) {
    this.db.prepare(`UPDATE legal_runs SET status='failed', error=?, completed_at=?, provider=?, model=?, input_tokens=?,
      cache_read_tokens=?, cache_write_tokens=?, output_tokens=?, reasoning_tokens=?, request_count=?,
      estimated_cost_microusd=?, pricing_version=? WHERE id=?`)
      .run(error, completedAt, usage.provider, usage.model, usage.inputTokens, usage.cacheReadTokens, usage.cacheWriteTokens,
        usage.outputTokens, usage.reasoningTokens, usage.requestCount, usage.estimatedCostMicrousd, usage.pricingVersion, id)
  }

  listRuns(matterId) {
    return this.db.prepare(`SELECT r.*, a.id AS artifact_id, a.status AS artifact_status, a.title AS artifact_title
      FROM legal_runs r LEFT JOIN artifacts a ON a.run_id=r.id
      WHERE r.matter_id=? ORDER BY r.created_at DESC`).all(matterId)
  }

  addArtifact(row) {
    this.db.prepare('INSERT INTO artifacts (id,run_id,title,content,status,created_at) VALUES (?,?,?,?,?,?)')
      .run(row.id, row.runId, row.title, row.content, row.status, row.createdAt)
    return row
  }

  listArtifacts(matterId) {
    return this.db.prepare(`SELECT a.*, r.agent_key, r.harness_session_id
      FROM artifacts a JOIN legal_runs r ON r.id=a.run_id WHERE r.matter_id=? ORDER BY a.created_at DESC`).all(matterId)
  }

  reviewArtifact(id, status, note, reviewedAt) {
    this.db.prepare('UPDATE artifacts SET status=?, reviewer_note=?, reviewed_at=? WHERE id=?')
      .run(status, note, reviewedAt, id)
    return this.db.prepare('SELECT * FROM artifacts WHERE id=?').get(id)
  }

  touch(matterId, now) {
    this.db.prepare('UPDATE matters SET updated_at=? WHERE id=?').run(now, matterId)
  }
}
