import { describe, it, expect } from "vitest";
import { StateStore } from "../../src/store/stateStore.js";
import { join } from "path";
import { tmpdir } from "os";
import { unlinkSync } from "fs";
import { formatAuditRowForDisplay } from "../../src/observability/auditDisplay.js";

describe("formatAuditRowForDisplay", () => {
  it("parses detail_json and redacts for public output", () => {
    const dbPath = join(tmpdir(), `ars-audit-fmt-${Date.now()}.db`);
    const store = new StateStore(dbPath);
    store.appendAudit({
      id: "e1",
      matched_rule: "r",
      gate_outcome: "allow",
      detail_json: JSON.stringify({ sessionId: "s", requestId: "r", token: "x" }),
    });
    const row = store.getAudit("e1");
    expect(row).toBeDefined();
    const fmt = formatAuditRowForDisplay(row!);
    expect(fmt.id).toBe("e1");
    expect((fmt.detail as { token: string }).token).toBe("***");
    store.close();
    try {
      unlinkSync(dbPath);
    } catch {
      /* ignore */
    }
  });
});
