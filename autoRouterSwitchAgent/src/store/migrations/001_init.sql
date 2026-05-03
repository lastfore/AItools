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
