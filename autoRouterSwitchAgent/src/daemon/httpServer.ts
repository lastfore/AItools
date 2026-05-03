import Fastify from "fastify";
import { handleDecide, type DecideBody } from "./decideHandler.js";

export type StartDaemonOpts = {
  port: number;
  host: string;
};

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
  await app.listen({ port: opts.port, host: opts.host });
  return {
    server: app.server,
    close: async () => {
      await app.close();
    },
  };
}
