import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { StateStore } from "../../src/store/stateStore.js";
import { recordLatencyEwma } from "../../src/signals/aggregator.js";
import { join } from "path";
import { tmpdir } from "os";
import { unlinkSync } from "fs";

describe("aggregator EWMA", () => {
  let dbPath: string;
  let store: StateStore;

  beforeEach(() => {
    dbPath = join(tmpdir(), `ars-agg-${Date.now()}.db`);
    store = new StateStore(dbPath);
  });

  afterEach(() => {
    try {
      store?.close();
    } catch {
      /* ignore */
    }
    try {
      unlinkSync(dbPath);
    } catch {
      /* ignore */
    }
  });

  it("records samples and exposes perf.latency_ewma via metrics", () => {
    recordLatencyEwma(store, 100);
    recordLatencyEwma(store, 200);
    const ewma = store.getMetricJson("perf.latency_ewma");
    expect(typeof ewma).toBe("number");
    expect(ewma as number).toBeGreaterThan(100);
  });
});
