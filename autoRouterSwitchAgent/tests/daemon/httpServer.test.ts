import { describe, it, expect, afterEach } from "vitest";
import { startDaemonServer } from "../../src/daemon/httpServer.js";
import { StateStore } from "../../src/store/stateStore.js";
import { join } from "path";
import { tmpdir } from "os";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "fs";

describe("daemon http", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => {
    if (close) await close();
  });

  it("POST /decide returns JSON route or null", async () => {
    const dir = mkdtempSync(join(tmpdir(), "ars-http-"));
    const dbPath = join(dir, "s.db");
    const logsDir = join(dir, "logs");
    const store = new StateStore(dbPath);
    const app = await startDaemonServer({
      port: 0,
      host: "127.0.0.1",
      getStore: () => store,
      logsDir,
    });
    close = async () => {
      await app.close();
      store.close();
      rmSync(dir, { recursive: true, force: true });
    };
    const addr = app.server.address();
    if (!addr || typeof addr === "string") throw new Error("no port");
    const res = await fetch(`http://127.0.0.1:${addr.port}/decide`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId: "s1", features: {} }),
    });
    expect(res.ok).toBe(true);
    const body = (await res.json()) as { route: string | null };
    expect(body).toHaveProperty("route");
  });

  it("GET /api/audit and /api/audit/:id and /health", async () => {
    const dir = mkdtempSync(join(tmpdir(), "ars-http-api-"));
    const dbPath = join(dir, "s.db");
    const logsDir = join(dir, "logs");
    const store = new StateStore(dbPath);
    store.appendAudit({
      id: "d1",
      matched_rule: "r",
      gate_outcome: "allow",
      detail_json: JSON.stringify({ sessionId: "s1", requestId: "q1", token: "secret" }),
    });
    const app = await startDaemonServer({
      port: 0,
      host: "127.0.0.1",
      getStore: () => store,
      logsDir,
    });
    close = async () => {
      await app.close();
      store.close();
      rmSync(dir, { recursive: true, force: true });
    };
    const addr = app.server.address();
    if (!addr || typeof addr === "string") throw new Error("no port");
    const base = `http://127.0.0.1:${addr.port}`;

    const health = await fetch(`${base}/health`);
    expect(health.ok).toBe(true);
    expect(await health.json()).toEqual({ ok: true });

    const list = await fetch(`${base}/api/audit?limit=10`);
    expect(list.ok).toBe(true);
    const rows = (await list.json()) as { id: string; detail: { token?: string } }[];
    expect(rows.length).toBe(1);
    expect(rows[0].detail.token).toBe("***");

    const one = await fetch(`${base}/api/audit/d1`);
    expect(one.ok).toBe(true);
    const row = (await one.json()) as { id: string };
    expect(row.id).toBe("d1");

    const missing = await fetch(`${base}/api/audit/nope`);
    expect(missing.status).toBe(404);
  });

  it("GET /api/logs reads ars.log", async () => {
    const dir = mkdtempSync(join(tmpdir(), "ars-http-logs-"));
    const dbPath = join(dir, "s.db");
    const logsDir = join(dir, "logs");
    const store = new StateStore(dbPath);
    mkdirSync(logsDir, { recursive: true });
    const logPath = join(logsDir, "ars.log");
    writeFileSync(logPath, JSON.stringify({ requestId: "rid1", level: 30, msg: "x" }) + "\n", "utf8");
    const app = await startDaemonServer({
      port: 0,
      host: "127.0.0.1",
      getStore: () => store,
      logsDir,
    });
    close = async () => {
      await app.close();
      store.close();
      rmSync(dir, { recursive: true, force: true });
    };
    const addr = app.server.address();
    if (!addr || typeof addr === "string") throw new Error("no port");
    const res = await fetch(`http://127.0.0.1:${addr.port}/api/logs?limit=5`);
    expect(res.ok).toBe(true);
    const lines = (await res.json()) as { requestId: string }[];
    expect(lines.some((l) => l.requestId === "rid1")).toBe(true);
  });
});
