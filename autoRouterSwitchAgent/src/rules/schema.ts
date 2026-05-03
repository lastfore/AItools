import { z } from "zod";
import type { ConversationPhase } from "../executor/channelGates.js";

const PhaseSchema = z.enum([
  "Idle",
  "InRequest",
  "InThinking",
  "InToolUse",
  "LockedPlan",
  "InRiskyPhase",
]);

const WhenSchema = z.object({
  request_tokenCount: z.string().optional(),
  phase: PhaseSchema.optional(),
  error_status: z.string().optional(),
});

const ActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("ccr_route"), route: z.string() }),
  z.object({
    type: z.literal("ccr_apply_router"),
    routerKey: z.string(),
    route: z.string(),
  }),
  z.object({ type: z.literal("ccr_restart") }),
]);

const ActionShorthand = z.union([
  z
    .object({ ccr_route: z.string() })
    .transform((a) => ({ type: "ccr_route" as const, route: a.ccr_route })),
  z
    .object({ ccr_restart: z.literal(true) })
    .transform(() => ({ type: "ccr_restart" as const })),
  z
    .object({
      ccr_apply_router: z.object({ key: z.string(), route: z.string() }),
    })
    .transform((a) => ({
      type: "ccr_apply_router" as const,
      routerKey: a.ccr_apply_router.key,
      route: a.ccr_apply_router.route,
    })),
]);

export const RuleSchema = z.object({
  name: z.string(),
  when: WhenSchema,
  action: z.union([ActionShorthand, ActionSchema]),
  priority: z.number().int(),
});

export const RulesFileSchema = z.object({
  rules: z.array(RuleSchema),
});

export type RulesFile = z.infer<typeof RulesFileSchema>;
export type Rule = z.infer<typeof RuleSchema>;
export type RuleAction = z.infer<typeof ActionSchema>;
