import Database from "better-sqlite3";

const INIT_SQL = `
CREATE TABLE IF NOT EXISTS sticky (
  session_id TEXT PRIMARY KEY,
  sticky_provider TEXT NOT NULL,
  until_epoch_ms INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS audit (
  id TEXT PRIMARY KEY,
  created_epoch_ms INTEGER NOT NULL,
  matched_rule TEXT,
  gate_outcome TEXT NOT NULL,
  detail_json TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS metrics_kv (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_epoch_ms INTEGER NOT NULL
);
`;

export type AuditRow = {
  id: string;
  created_epoch_ms?: number;
  matched_rule: string | null;
  gate_outcome: string;
  detail_json: string;
};

export class StateStore {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.exec(INIT_SQL);
  }

  appendAudit(row: Omit<AuditRow, "created_epoch_ms"> & { id: string }) {
    const stmt = this.db.prepare(
      `INSERT INTO audit (id, created_epoch_ms, matched_rule, gate_outcome, detail_json)
       VALUES (@id, @created_epoch_ms, @matched_rule, @gate_outcome, @detail_json)`,
    );
    stmt.run({
      id: row.id,
      created_epoch_ms: Date.now(),
      matched_rule: row.matched_rule,
      gate_outcome: row.gate_outcome,
      detail_json: row.detail_json,
    });
  }

  getAudit(id: string): AuditRow | undefined {
    const stmt = this.db.prepare(
      `SELECT id, created_epoch_ms, matched_rule, gate_outcome, detail_json FROM audit WHERE id = ?`,
    );
    return stmt.get(id) as AuditRow | undefined;
  }

  getMetricJson(key: string): unknown | undefined {
    const stmt = this.db.prepare(`SELECT value_json FROM metrics_kv WHERE key = ?`);
    const row = stmt.get(key) as { value_json: string } | undefined;
    if (!row) return undefined;
    try {
      return JSON.parse(row.value_json) as unknown;
    } catch {
      return undefined;
    }
  }

  setMetricJson(key: string, value: unknown) {
    const stmt = this.db.prepare(
      `INSERT INTO metrics_kv (key, value_json, updated_epoch_ms)
       VALUES (@key, @value_json, @updated_epoch_ms)
       ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_epoch_ms = excluded.updated_epoch_ms`,
    );
    stmt.run({
      key,
      value_json: JSON.stringify(value),
      updated_epoch_ms: Date.now(),
    });
  }

  close() {
    this.db.close();
  }
}
