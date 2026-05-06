import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { StateStore } from "../../src/store/stateStore.js";
import { join } from "path";
import { tmpdir } from "os";
import { unlinkSync, mkdtempSync, rmSync } from "fs";

describe("StateStore", () => {
  let dbPath: string;
  beforeEach(() => {
    dbPath = join(tmpdir(), `ars-${Date.now()}.db`);
  });
  afterEach(() => {
    try {
      unlinkSync(dbPath);
    } catch {
      /* ignore */
    }
  });

  it("opens and inserts audit row", () => {
    const store = new StateStore(dbPath);
    store.appendAudit({
      id: "dec-1",
      matched_rule: "test",
      gate_outcome: "allow",
      detail_json: "{}",
    });
    const row = store.getAudit("dec-1");
    expect(row?.matched_rule).toBe("test");
    store.close();
  });
});

describe("StateStore listAudit", () => {
  let dir: string;
  let dbPath: string;
  let store: StateStore;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "ars-list-audit-"));
    dbPath = join(dir, "state.db");
    store = new StateStore(dbPath);
    store.appendAudit({
      id: "a1",
      matched_rule: "r1",
      gate_outcome: "allow",
      detail_json: JSON.stringify({ sessionId: "sess1", requestId: "req1" }),
    });
    store.appendAudit({
      id: "a2",
      matched_rule: null,
      gate_outcome: "defer",
      detail_json: JSON.stringify({ sessionId: "sess2", reason: "x" }),
    });
  });

  afterEach(() => {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("lists newest first with limit", () => {
    const rows = store.listAudit({ limit: 10 });
    expect(rows.length).toBe(2);
    expect(rows[0].id).toBe("a2");
  });

  it("filters by json sessionId", () => {
    const rows = store.listAudit({ limit: 10, sessionId: "sess1" });
    expect(rows.map((r) => r.id)).toEqual(["a1"]);
  });
});
