import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import test from 'node:test'
import { LegalDeskDatabase } from '../lib/database.js'

test('adds document and usage columns to an existing LegalDesk database', () => {
  const dir = mkdtempSync(join(tmpdir(), 'legaldesk-migration-'))
  const path = join(dir, 'data', 'legaldesk.sqlite')
  mkdirSync(join(dir, 'data'))
  const legacy = new DatabaseSync(path)
  legacy.exec(`
    CREATE TABLE matters (id TEXT PRIMARY KEY, title TEXT NOT NULL, reference_no TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'active', created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE materials (id TEXT PRIMARY KEY, matter_id TEXT NOT NULL REFERENCES matters(id) ON DELETE CASCADE, name TEXT NOT NULL, media_type TEXT NOT NULL, byte_size INTEGER NOT NULL, sha256 TEXT NOT NULL, stored_path TEXT NOT NULL, imported_at TEXT NOT NULL);
    CREATE TABLE snapshots (id TEXT PRIMARY KEY, matter_id TEXT NOT NULL REFERENCES matters(id) ON DELETE CASCADE, label TEXT NOT NULL, manifest_json TEXT NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE legal_runs (id TEXT PRIMARY KEY, matter_id TEXT NOT NULL REFERENCES matters(id) ON DELETE CASCADE, snapshot_id TEXT NOT NULL REFERENCES snapshots(id), agent_key TEXT NOT NULL, harness_session_id TEXT NOT NULL UNIQUE, status TEXT NOT NULL, created_at TEXT NOT NULL, completed_at TEXT, error TEXT);
  `)
  legacy.close()
  const database = new LegalDeskDatabase(path)
  try {
    const materialColumns = new Set(database.db.prepare('PRAGMA table_info(materials)').all().map(row => row.name))
    const runColumns = new Set(database.db.prepare('PRAGMA table_info(legal_runs)').all().map(row => row.name))
    assert.equal(materialColumns.has('derived_sha256'), true)
    assert.equal(runColumns.has('estimated_cost_microusd'), true)
  } finally {
    database.close()
    rmSync(dir, { recursive: true, force: true })
  }
})
