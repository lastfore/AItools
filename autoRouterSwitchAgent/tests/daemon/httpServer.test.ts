import { describe, it, expect, afterEach } from "vitest";
import { startDaemonServer } from "../../src/daemon/httpServer.js";

describe("daemon http", () => {
  let close: (() => Promise<void>) | undefined;
  afterEach(async () => {
    if (close) await close();
  });

  it("POST /decide returns JSON route or null", async () => {
    const app = await startDaemonServer({ port: 0, host: "127.0.0.1" });
    close = app.close;
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
});
