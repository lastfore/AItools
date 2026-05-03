import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { StateStore } from "../../src/store/stateStore.js";
import { join } from "path";
import { tmpdir } from "os";
import { unlinkSync } from "fs";

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
