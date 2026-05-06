import type { ConversationPhase } from "../executor/channelGates.js";
import type { AppConfig } from "../config/schema.js";
import type { RulesFile } from "../rules/schema.js";
import type { RuleEngine } from "../rules/engine.js";
import type { StateStore } from "../store/stateStore.js";
import { evaluateCCRChannel } from "../executor/channelGates.js";
import { buildSignals } from "../signals/aggregator.js";
import {
  applyCcrRouterDefault,
  triggerCcrRestart,
  waitForCcrHealthy,
  type CcrChannelOptions,
} from "../executor/ccrChannel.js";
import { randomUUID } from "crypto";
import type { Logger } from "pino";

export type DecideBody = {
  sessionId?: string;
  features?: Record<string, unknown>;
  phase?: ConversationPhase;
};

export type DecideContext = {
  config: AppConfig;
  store: StateStore;
  rules: RulesFile;
  ccrConfigPath?: string;
  logger?: Logger;
};

let decideContext: DecideContext | null = null;

export function setDecideContext(ctx: DecideContext | null) {
  if (decideContext?.store && decideContext.store !== ctx?.store) {
    try {
      decideContext.store.close();
    } catch {
      /* ignore */
    }
  }
  decideContext = ctx;
}

export function getDecideContext(): DecideContext | null {
  return decideContext;
}

function auditDetail(sessionId: string | undefined, requestId: string, detail: Record<string, unknown>): string {
  return JSON.stringify({
    sessionId: sessionId ?? null,
    requestId,
    ...detail,
  });
}

function logDecide(payload: {
  decisionId: string;
  requestId: string;
  sessionId: string | null;
  matched_rule: string | null;
  gate_outcome: string;
  route: string | null;
}) {
  getDecideContext()?.logger?.info(payload, "decide");
}

/** 供测试注入 RuleEngine 工厂（可选）。 */
let engineFactory: ((rules: RulesFile) => RuleEngine) | null = null;
export function setEngineFactory(f: ((rules: RulesFile) => RuleEngine) | null) {
  engineFactory = f;
}

export async function handleDecide(body: DecideBody): Promise<{ route: string | null; decisionId?: string | null }> {
  if (!decideContext) {
    return { route: null, decisionId: null };
  }
  return handleDecideWithDeps({
    config: decideContext.config,
    store: decideContext.store,
    rules: decideContext.rules,
    sessionId: body.sessionId,
    features: body.features ?? {},
    phase: body.phase ?? inferPhase(body.features ?? {}),
    ccrConfigPath: decideContext.ccrConfigPath,
  });
}

function inferPhase(features: Record<string, unknown>): ConversationPhase {
  const p = features.phase;
  if (typeof p === "string") return p as ConversationPhase;
  // §4.6 策略 A：流不可观测且存在错误时视为 InRiskyPhase
  const streamObservable = features.streamObservable === true;
  const errorStatus = features.error_status;
  if (!streamObservable && errorStatus != null && errorStatus !== "") {
    return "InRiskyPhase";
  }
  return "Idle";
}

export async function handleDecideWithDeps(deps: {
  config: AppConfig;
  store: StateStore;
  rules: RulesFile;
  phase: ConversationPhase;
  sessionId?: string;
  features: Record<string, unknown>;
  ccrConfigPath?: string;
}): Promise<{ route: string | null; decisionId: string | null }> {
  const { RuleEngine } = await import("../rules/engine.js");
  const engine = engineFactory ? engineFactory(deps.rules) : new RuleEngine(deps.rules);
  const storeMetrics = loadStoreMetrics(deps.store);
  const signals = buildSignals({
    features: deps.features,
    storeMetrics,
    phase: deps.phase,
  });
  const win = engine.evaluate(signals as Record<string, unknown>);
  const decisionId = randomUUID();
  const requestId = randomUUID();

  if (!win) {
    deps.store.appendAudit({
      id: decisionId,
      matched_rule: null,
      gate_outcome: "allow",
      detail_json: auditDetail(deps.sessionId, requestId, { reason: "no_rule" }),
    });
    logDecide({
      decisionId,
      requestId,
      sessionId: deps.sessionId ?? null,
      matched_rule: null,
      gate_outcome: "allow",
      route: null,
    });
    return { route: null, decisionId };
  }

  const requiresRestart = win.action.type === "ccr_apply_router" || win.action.type === "ccr_restart";
  const gate = evaluateCCRChannel({
    phase: deps.phase,
    rulePriority: win.rule.priority,
    emergencyPriorityThreshold: deps.config.safety_gate.emergency_priority,
    activeSessionCount: typeof deps.features.activeSessionCount === "number" ? deps.features.activeSessionCount : 1,
    sseInflight: Boolean(deps.features.sseInflight),
    hasPendingRestart: Boolean(deps.features.hasPendingRestart),
    requiresRestart,
    sticky: undefined,
  });

  if (gate === "defer") {
    deps.store.appendAudit({
      id: decisionId,
      matched_rule: win.rule.name,
      gate_outcome: "defer",
      detail_json: auditDetail(deps.sessionId, requestId, { action: win.action }),
    });
    logDecide({
      decisionId,
      requestId,
      sessionId: deps.sessionId ?? null,
      matched_rule: win.rule.name,
      gate_outcome: "defer",
      route: null,
    });
    return { route: null, decisionId };
  }

  let routeOut: string | null = null;
  if (win.action.type === "ccr_route") {
    routeOut = resolveRouteString(win.action.route, deps.config);
  } else if (win.action.type === "ccr_apply_router") {
    routeOut = resolveRouteString(win.action.route, deps.config);
    const ccrPath = deps.ccrConfigPath;
    if (!ccrPath) {
      deps.store.appendAudit({
        id: decisionId,
        matched_rule: win.rule.name,
        gate_outcome: "allow",
        detail_json: auditDetail(deps.sessionId, requestId, { error: "missing_ccr_config_path" }),
      });
      logDecide({
        decisionId,
        requestId,
        sessionId: deps.sessionId ?? null,
        matched_rule: win.rule.name,
        gate_outcome: "allow",
        route: null,
      });
      return { route: null, decisionId };
    }
    const opt: CcrChannelOptions = {
      configPath: ccrPath,
      ccrBaseUrl: deps.config.daemon.ccr_url,
      healthPath: deps.config.daemon.ccr_health_path,
    };
    await applyCcrRouterDefault(opt, win.action.routerKey, routeOut);
  } else if (win.action.type === "ccr_restart") {
    const ccrPath = deps.ccrConfigPath;
    if (ccrPath) {
      const opt: CcrChannelOptions = {
        configPath: ccrPath,
        ccrBaseUrl: deps.config.daemon.ccr_url,
        healthPath: deps.config.daemon.ccr_health_path,
      };
      await triggerCcrRestart(opt);
      await waitForCcrHealthy(opt);
    }
    routeOut = null;
  }

  deps.store.appendAudit({
    id: decisionId,
    matched_rule: win.rule.name,
    gate_outcome: gate,
    detail_json: auditDetail(deps.sessionId, requestId, { action: win.action, route: routeOut }),
  });

  logDecide({
    decisionId,
    requestId,
    sessionId: deps.sessionId ?? null,
    matched_rule: win.rule.name,
    gate_outcome: gate,
    route: routeOut,
  });

  return { route: routeOut, decisionId };
}

function loadStoreMetrics(store: StateStore): Record<string, unknown> {
  const ewma = store.getMetricJson("perf.latency_ewma");
  const out: Record<string, unknown> = {};
  if (typeof ewma === "number") {
    out["perf.p95_ms"] = ewma;
  }
  return out;
}

function resolveRouteString(routeOrKey: string, config: AppConfig): string {
  const chain = config.provider_chains[routeOrKey];
  if (chain?.length) {
    return chain.length === 2 ? `${chain[0]},${chain[1]}` : chain.join(",");
  }
  return routeOrKey;
}

