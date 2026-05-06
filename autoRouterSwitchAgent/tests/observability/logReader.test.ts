import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFileSync, unlinkSync, mkdtempSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { readRecentLogs } from "../../src/observability/logReader.js";

describe("readRecentLogs", () => {
  let dir: string;
  let logFile: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "ars-logread-"));
    logFile = join(dir, "ars.log");
    writeFileSync(
      logFile,
      [
        JSON.stringify({ level: 30, msg: "a", requestId: "r1" }),
        JSON.stringify({ level: 30, msg: "b", requestId: "r2" }),
      ].join("\n") + "\n",
      "utf8",
    );
  });

  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("returns newest-first up to limit", async () => {
    const rows = await readRecentLogs(logFile, { limit: 10 });
    expect(rows.length).toBe(2);
    expect((rows[0] as { requestId?: string }).requestId).toBe("r2");
  });

  it("filters by requestId", async () => {
    const rows = await readRecentLogs(logFile, { limit: 10, requestId: "r1" });
    expect(rows.length).toBe(1);
    expect((rows[0] as { requestId?: string }).requestId).toBe("r1");
  });

  it("missing file returns empty", async () => {
    unlinkSync(logFile);
    const rows = await readRecentLogs(logFile, { limit: 10 });
    expect(rows).toEqual([]);
  });
});
