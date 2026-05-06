import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { handleDecide, type DecideBody } from "./decideHandler.js";
import { registerObservabilityRoutes } from "./observabilityApi.js";
import type { StateStore } from "../store/stateStore.js";

export type StartDaemonOpts = {
  port: number;
  host: string;
  getStore: () => StateStore;
  logsDir: string;
};

const publicRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "public");

export async function startDaemonServer(opts: StartDaemonOpts) {
  const app = Fastify({ logger: false });
  app.post("/decide", async (req, reply) => {
    const body = req.body as Record<string, unknown>;
    const decide: DecideBody = {
      sessionId: typeof body.sessionId === "string" ? body.sessionId : undefined,
      features:
        typeof body.features === "object" && body.features !== null
          ? (body.features as Record<string, unknown>)
          : {},
      phase: body.phase as DecideBody["phase"],
    };
    const result = await handleDecide(decide);
    return reply.send(result);
  });

  await registerObservabilityRoutes(app, {
    getStore: opts.getStore,
    logsDir: opts.logsDir,
  });

  await app.register(fastifyStatic, {
    root: publicRoot,
    prefix: "/",
  });

  await app.listen({ port: opts.port, host: opts.host });
  return {
    server: app.server,
    close: async () => {
      await app.close();
    },
  };
}
