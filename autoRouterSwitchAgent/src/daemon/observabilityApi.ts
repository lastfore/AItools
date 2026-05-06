import type { FastifyInstance } from "fastify";
import { join } from "path";
import type { StateStore } from "../store/stateStore.js";
import { formatAuditRowForDisplay } from "../observability/auditDisplay.js";
import { redactForPublicOutput } from "../observability/redact.js";
import { readRecentLogs } from "../observability/logReader.js";

export type ObservabilityDeps = {
  getStore: () => StateStore;
  logsDir: string;
};

export async function registerObservabilityRoutes(app: FastifyInstance, deps: ObservabilityDeps) {
  app.get("/health", async (_req, reply) => reply.send({ ok: true }));

  app.get("/api/audit", async (req, reply) => {
    const q = req.query as Record<string, string | undefined>;
    const limit = q.limit ? Number(q.limit) : 50;
    const fromEpochMs = q.from ? Number(q.from) : undefined;
    const toEpochMs = q.to ? Number(q.to) : undefined;
    const sessionId = q.sessionId;
    const store = deps.getStore();
    const rows = store.listAudit({
      limit: Number.isFinite(limit) ? limit : 50,
      fromEpochMs: fromEpochMs !== undefined && Number.isFinite(fromEpochMs) ? fromEpochMs : undefined,
      toEpochMs: toEpochMs !== undefined && Number.isFinite(toEpochMs) ? toEpochMs : undefined,
      sessionId: sessionId && sessionId.length > 0 ? sessionId : undefined,
    });
    return reply.send(rows.map(formatAuditRowForDisplay));
  });

  app.get<{ Params: { decisionId: string } }>("/api/audit/:decisionId", async (req, reply) => {
    const store = deps.getStore();
    const row = store.getAudit(req.params.decisionId);
    if (!row) return reply.code(404).send({ error: "not_found" });
    return reply.send(formatAuditRowForDisplay(row));
  });

  app.get("/api/logs", async (req, reply) => {
    const q = req.query as Record<string, string | undefined>;
    const limit = q.limit ? Number(q.limit) : 50;
    const requestId = q.requestId;
    const level = q.level;
    const logPath = join(deps.logsDir, "ars.log");
    const entries = await readRecentLogs(logPath, {
      limit: Number.isFinite(limit) ? limit : 50,
      requestId: requestId && requestId.length > 0 ? requestId : undefined,
      level: level !== undefined && level !== "" ? level : undefined,
    });
    return reply.send(entries.map((e) => redactForPublicOutput(e)));
  });
}
