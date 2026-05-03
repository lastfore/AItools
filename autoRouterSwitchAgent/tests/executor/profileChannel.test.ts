import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Database from "better-sqlite3";
import { applyProfileSwitch } from "../../src/executor/profileChannel.js";
import { mkdirSync, readFileSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

const INIT_PROVIDERS = `
CREATE TABLE providers (
  id TEXT NOT NULL,
  app_type TEXT NOT NULL,
  name TEXT NOT NULL,
  settings_config TEXT NOT NULL,
  website_url TEXT,
  category TEXT,
  created_at INTEGER,
  sort_index INTEGER,
  notes TEXT,
  icon TEXT,
  icon_color TEXT,
  meta TEXT NOT NULL DEFAULT '{}',
  is_current BOOLEAN NOT NULL DEFAULT 0,
  in_failover_queue BOOLEAN NOT NULL DEFAULT 0,
  PRIMARY KEY (id, app_type)
);
`;

describe("ProfileChannel", () => {
  let dbPath: string;
  let settingsPath: string;

  beforeEach(() => {
    const dir = join(tmpdir(), `ars-prof-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    dbPath = join(dir, "data.sqlite");
    settingsPath = join(dir, "settings.json");
    const db = new Database(dbPath);
    db.exec(INIT_PROVIDERS);
    db.prepare(
      `INSERT INTO providers (id, app_type, name, settings_config, meta, is_current)
       VALUES ('p1', 'claude', 'P1', '{}', '{}', 1)`,
    ).run();
    db.prepare(
      `INSERT INTO providers (id, app_type, name, settings_config, meta, is_current)
       VALUES ('p2', 'claude', 'P2', '{}', '{}', 0)`,
    ).run();
    db.close();
  });

  afterEach(() => {
    try {
      unlinkSync(dbPath);
      unlinkSync(settingsPath);
    } catch {
      /* ignore */
    }
  });

  it("switches is_current and writes settings.json", async () => {
    await applyProfileSwitch({ dbPath, settingsPath, appType: "claude" }, "p2");
    const db = new Database(dbPath);
    const cur = db
      .prepare("SELECT id, is_current FROM providers WHERE app_type = 'claude' ORDER BY id")
      .all() as { id: string; is_current: number }[];
    db.close();
    expect(cur.find((r) => r.id === "p2")?.is_current).toBe(1);
    const j = JSON.parse(readFileSync(settingsPath, "utf8")) as { currentProviderClaude: string };
    expect(j.currentProviderClaude).toBe("p2");
  });
});
