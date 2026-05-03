import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { handleDecideWithDeps, setEngineFactory } from "../../src/daemon/decideHandler.js";
import type { AppConfig } from "../../src/config/schema.js";
import type { RulesFile } from "../../src/rules/schema.js";
import { StateStore } from "../../src/store/stateStore.js";
import { join } from "path";
import { tmpdir } from "os";
import { unlinkSync } from "fs";

describe("decideHandler pipeline", () => {
  let dbPath: string;
  let store: StateStore;

  const config: AppConfig = {
    daemon: {
      http_port: 3457,
      ccr_url: "http://127.0.0.1:9",
      ccr_health_path: "/health",
      log_level: "silent",
    },
    safety_gate: {
      emergency_priority: 200,
      sticky_ttl_seconds: 0,
      freeze_period_seconds: 0,
    },
    provider_chains: {
      anthropic: ["p", "m"],
    },
    rules_file: "/dev/null",
  };

  beforeEach(() => {
    dbPath = join(tmpdir(), `ars-decide-${Date.now()}.db`);
    store = new StateStore(dbPath);
  });

  afterEach(() => {
    setEngineFactory(null);
    try {
      store.close();
      unlinkSync(dbPath);
    } catch {
      /* ignore */
    }
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("Signal→Rule→Gate yields route for ccr_route", async () => {
    const rules: RulesFile = {
      rules: [
        {
          name: "r1",
          when: { request_tokenCount: ">1" },
          action: { type: "ccr_route", route: "anthropic" },
          priority: 50,
        },
      ],
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("ok", { status: 200 })),
    );
    const out = await handleDecideWithDeps({
      config,
      store,
      rules,
      phase: "Idle",
      features: { request_tokenCount: 10 },
      ccrConfigPath: join(tmpdir(), "nope.json"),
    });
    expect(out.route).toBe("p,m");
  });

  it("defers when gate says defer", async () => {
    const rules: RulesFile = {
      rules: [
        {
          name: "r1",
          when: {},
          action: { type: "ccr_apply_router", routerKey: "default", route: "x,y" },
          priority: 50,
        },
      ],
    };
    const out = await handleDecideWithDeps({
      config,
      store,
      rules,
      phase: "InThinking",
      features: {},
      ccrConfigPath: join(tmpdir(), "nope.json"),
    });
    expect(out.route).toBeNull();
  });
});
