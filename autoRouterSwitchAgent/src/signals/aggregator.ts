const DEFAULT_SAMPLES = 20;

export type SignalSnapshot = Record<string, unknown>;

export function buildSignals(input: {
  features: Record<string, unknown>;
  storeMetrics: Record<string, unknown>;
  phase: string;
}): SignalSnapshot {
  const tokenCount =
    typeof input.features.tokenCount === "number" ? input.features.tokenCount : undefined;
  return {
    ...input.storeMetrics,
    ...input.features,
    ...(tokenCount !== undefined ? { request_tokenCount: tokenCount } : {}),
    phase: input.phase,
  };
}

/** 滚动 EWMA：将样本存入 metrics_kv，并更新 `perf.latency_ewma`（占位 p95 代理）。 */
export function recordLatencyEwma(store: import("../store/stateStore.js").StateStore, sampleMs: number) {
  const key = "perf.latency_samples";
  const prev = store.getMetricJson(key);
  const arr: number[] = Array.isArray(prev) ? (prev as number[]).slice(-DEFAULT_SAMPLES + 1) : [];
  arr.push(sampleMs);
  store.setMetricJson(key, arr);
  const alpha = 0.35;
  let ewma =
    typeof store.getMetricJson("perf.latency_ewma") === "number"
      ? (store.getMetricJson("perf.latency_ewma") as number)
      : sampleMs;
  ewma = alpha * sampleMs + (1 - alpha) * ewma;
  store.setMetricJson("perf.latency_ewma", ewma);
}
