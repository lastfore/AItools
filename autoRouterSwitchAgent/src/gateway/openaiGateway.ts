import Fastify from "fastify";

export type OpenAiGatewayOpts = {
  host?: string;
  port: number;
  forwardBaseUrl: string;
  enableTools?: boolean;
};

/** 最小 OpenAI 形态：转发到 forwardBaseUrl 的 /v1/chat/completions（测试与非 SSE 场景可完整缓冲）。 */
export async function startOpenAiGateway(opts: OpenAiGatewayOpts) {
  const host = opts.host ?? "127.0.0.1";
  const forwardBase = opts.forwardBaseUrl.replace(/\/$/, "");
  const app = Fastify({ logger: false });

  app.post("/v1/chat/completions", async (req, reply) => {
    const body = req.body as Record<string, unknown>;
    if (opts.enableTools !== true && Array.isArray(body.tools)) {
      return reply.code(400).send({ error: { message: "tools disabled by gateway config" } });
    }
    const target = `${forwardBase}/v1/chat/completions`;
    const headers: Record<string, string> = {
      "content-type": "application/json",
    };
    const auth = req.headers.authorization;
    if (typeof auth === "string") headers.authorization = auth;
    const res = await fetch(target, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const ct = res.headers.get("content-type") || "application/json";
    const buf = Buffer.from(await res.arrayBuffer());
    return reply.code(res.status).header("content-type", ct).send(buf);
  });

  await app.listen({ port: opts.port, host });
  return {
    server: app.server,
    close: async () => {
      await app.close();
    },
  };
}
