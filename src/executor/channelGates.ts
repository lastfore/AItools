/**
 * CCRChannel / ProfileChannel 与 SafetyGate 的挂接点。
 * 完整语义见仓库内 spec/autoRouterSwitchAgent_design.md 第四节。
 */

export type ConversationPhase =
  | "Idle"
  | "InRequest"
  | "InThinking"
  | "InToolUse"
  | "LockedPlan"
  | "InRiskyPhase";

export type GateOutcome = "allow" | "defer" | "emergency_only";

export interface StickyState {
  sessionId: string;
  stickyUntilEpochMs: number;
}

export interface PhaseContext {
  phase: ConversationPhase;
  sticky?: StickyState;
  rulePriority: number;
  emergencyPriorityThreshold: number;
}

export interface IntegrationContext {
  /** GlobalProfileImpact：多会话/多 CLI 活跃时倾向 defer */
  activeSessionCount: number;
  /** CCRrestartInflight：存在未结束 SSE 或 InRequest */
  sseInflight: boolean;
  hasPendingRestart: boolean;
  /** EffectiveApply：是否要求用户侧重启终端才一致 */
  envCoherenceWarning?: boolean;
}

export interface CCRActionContext extends PhaseContext, IntegrationContext {
  /** true 表示将调用 POST /api/restart */
  requiresRestart: boolean;
}

export interface ProfileActionContext extends PhaseContext, IntegrationContext {
  /** 可选：MCP/Skills 集变更时的软警告 */
  mcpSkillsMayDiverge?: boolean;
}

export function evaluateCCRChannel(context: CCRActionContext): GateOutcome {
  if (context.phase === "InThinking" || context.phase === "InToolUse") {
    return context.rulePriority >= context.emergencyPriorityThreshold
      ? "emergency_only"
      : "defer";
  }
  if (context.phase === "LockedPlan") {
    return context.rulePriority >= context.emergencyPriorityThreshold
      ? "emergency_only"
      : "defer";
  }
  if (context.requiresRestart && (context.sseInflight || context.phase === "InRequest")) {
    return "defer";
  }
  if (context.hasPendingRestart && context.requiresRestart) {
    return "defer";
  }
  if (context.sticky && Date.now() < context.sticky.stickyUntilEpochMs) {
    return context.rulePriority >= context.emergencyPriorityThreshold ? "allow" : "defer";
  }
  return "allow";
}

export function evaluateProfileChannel(context: ProfileActionContext): GateOutcome {
  if (context.phase === "InThinking" || context.phase === "InToolUse" || context.phase === "LockedPlan") {
    return context.rulePriority >= context.emergencyPriorityThreshold
      ? "emergency_only"
      : "defer";
  }
  if (context.activeSessionCount > 1) {
    return context.rulePriority >= context.emergencyPriorityThreshold ? "emergency_only" : "defer";
  }
  if (context.sseInflight) {
    return "defer";
  }
  return "allow";
}
