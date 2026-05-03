import { z } from "zod";

export const DaemonConfigSchema = z.object({
  http_port: z.number().int().positive(),
  ccr_url: z.string().url(),
  ccr_health_path: z.string().startsWith("/"),
  log_level: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]),
});

export const SafetyGateConfigSchema = z.object({
  emergency_priority: z.number().int(),
  sticky_ttl_seconds: z.number().int().nonnegative(),
  freeze_period_seconds: z.number().int().nonnegative(),
});

export const GatewayConfigSchema = z.object({
  http_port: z.number().int().positive().default(3458),
  forward_base_url: z.string().url().optional(),
  enable_tools: z.boolean().default(false),
});

export const AppConfigSchema = z.object({
  daemon: DaemonConfigSchema,
  safety_gate: SafetyGateConfigSchema,
  provider_chains: z.record(z.array(z.string())),
  rules_file: z.string().min(1),
  gateway: GatewayConfigSchema.optional(),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
