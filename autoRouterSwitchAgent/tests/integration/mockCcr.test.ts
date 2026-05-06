import { describe, it, expect, afterEach } from "vitest";
import Fastify from "fastify";
import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { startDaemonServer } from "../../src/daemon/httpServer.js";
import { setDecideContext } from "../../src/daemon/decideHandler.js";
import { StateStore } from "../../src/store/stateStore.js";
import type { AppConfig } from "../../src/config/schema.js";
import type { RulesFile } from "../../src/rules/schema.js";

describe("mock CCR integration", () => {
  let closeDaemon: (() => Promise<void>) | undefined;
  let closeMock: (() => Promise<void>) | undefined;

  afterEach(async () => {
    if (closeDaemon) await closeDaemon();
    if (closeMock) await closeMock();
    setDecideContext(null);
  });

  it("applies rule and calls /api/restart exactly once", async () => {
    let restartCount = 0;
    const mock = Fastify({ logger: false });
    mock.post("/api/restart", async () => {
      restartCount++;
      return {};
    });
    mock.get("/health", async (_, reply) => reply.code(200).send("ok"));
    mock.post("/v1/messages", async () => ({}));
    await mock.listen({ port: 0, host: "127.0.0.1" });
    closeMock = () => mock.close();
    const mockAddr = mock.server.address();
    if (!mockAddr || typeof mockAddr === "string") throw new Error("mock addr");
    const ccrUrl = `http://127.0.0.1:${mockAddr.port}`;

    const ccrPath = process.env.CCR_CONFIG_PATH!;
    mkdirSync(dirname(ccrPath), { recursive: true });
    writeFileSync(
      ccrPath,
      JSON.stringify({
        HOST: "127.0.0.1",
        PORT: mockAddr.port,
        Router: { default: "old,old" },
      }),
      "utf8",
    );

    const rules: RulesFile = {
      rules: [
        {
          name: "on429",
          when: { error_status: "429" },
          action: { type: "ccr_apply_router", routerKey: "default", route: "new,model" },
          priority: 200,
        },
      ],
    };

    const config: AppConfig = {
      daemon: {
        http_port: 0,
        ccr_url: ccrUrl,
        ccr_health_path: "/health",
        log_level: "silent",
      },
      safety_gate: {
        emergency_priority: 200,
        sticky_ttl_seconds: 0,
        freeze_period_seconds: 0,
      },
      provider_chains: {},
      rules_file: join(dirname(ccrPath), "rules.yaml"),
    };

    const dbPath = join(process.env.ARS_HOME!, `int-${Date.now()}.db`);
    const store = new StateStore(dbPath);
    setDecideContext({
      config,
      store,
      rules,
      ccrConfigPath: ccrPath,
    });

    const logsDir = join(process.env.ARS_HOME!, "logs");
    mkdirSync(logsDir, { recursive: true });
    const daemon = await startDaemonServer({
      port: 0,
      host: "127.0.0.1",
      getStore: () => store,
      logsDir,
    });
    closeDaemon = daemon.close;
    const dAddr = daemon.server.address();
    if (!dAddr || typeof dAddr === "string") throw new Error("daemon addr");

    const res = await fetch(`http://127.0.0.1:${dAddr.port}/decide`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sessionId: "s1",
        features: { error_status: "429", streamObservable: true },
        phase: "Idle",
      }),
    });
    expect(res.ok).toBe(true);
    expect(restartCount).toBe(1);
  });
});
