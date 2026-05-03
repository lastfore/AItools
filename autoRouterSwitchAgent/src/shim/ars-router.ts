const DEFAULT_DAEMON_URL = process.env.ARS_DAEMON_URL ?? "http://127.0.0.1:3457";

export async function decideViaDaemon(
  payload: { sessionId?: string; features: Record<string, unknown> },
  opts: { url: string; timeoutMs: number },
): Promise<string | null> {
  try {
    const res = await fetch(opts.url.replace(/\/$/, "") + "/decide", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessionId: payload.sessionId, features: payload.features }),
      signal: AbortSignal.timeout(opts.timeoutMs),
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { route?: string | null };
    return typeof j.route === "string" ? j.route : null;
  } catch {
    return null;
  }
}

export default async function customRouter(req: unknown, _config: unknown, _ctx: unknown) {
  const r = req as {
    body?: { metadata?: { user_id?: string }; messages?: unknown[] };
    tokenCount?: number;
  };
  const sessionId = r.body?.metadata?.user_id;
  const features: Record<string, unknown> = {
    tokenCount: r.tokenCount,
    has_tools: Array.isArray(r.body?.messages),
  };
  return decideViaDaemon(
    { sessionId, features },
    { url: DEFAULT_DAEMON_URL, timeoutMs: 5 },
  );
}
