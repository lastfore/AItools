import type { RulesFile, Rule } from "./schema.js";

export type EngineSignal = {
  request_tokenCount?: number;
  phase?: string;
  error_status?: string;
};

export type RuleWin = {
  rule: Rule;
  action: Rule["action"];
};

function parseCompareTokenCount(expr: string | undefined, value: number | undefined): boolean {
  if (!expr) return true;
  if (value === undefined) return false;
  const m = expr.match(/^>(\d+)$/);
  if (!m) return false;
  const n = Number(m[1]);
  return value > n;
}

export class RuleEngine {
  constructor(private file: RulesFile) {}

  evaluate(signals: Record<string, unknown>): RuleWin | null {
    const sig: EngineSignal = {
      request_tokenCount:
        typeof signals.request_tokenCount === "number" ? signals.request_tokenCount : undefined,
      phase: typeof signals.phase === "string" ? signals.phase : undefined,
      error_status:
        typeof signals.error_status === "string" || typeof signals.error_status === "number"
          ? String(signals.error_status)
          : undefined,
    };

    const sorted = [...this.file.rules].sort((a, b) => b.priority - a.priority || 0);

    for (const rule of sorted) {
      if (!parseCompareTokenCount(rule.when.request_tokenCount, sig.request_tokenCount)) continue;
      if (rule.when.phase !== undefined && rule.when.phase !== sig.phase) continue;
      if (
        rule.when.error_status !== undefined &&
        rule.when.error_status !== (sig.error_status ?? undefined)
      )
        continue;
      return { rule, action: rule.action as RuleWin["action"] };
    }
    return null;
  }
}
