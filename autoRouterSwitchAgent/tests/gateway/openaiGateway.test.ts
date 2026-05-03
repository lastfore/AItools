import { describe, it, expect, vi, afterEach } from "vitest";
import { startOpenAiGateway } from "../../src/gateway/openaiGateway.js";

describe("openai gateway", () => {
  let close: (() => Promise<void>) | undefined;
  const nativeFetch = globalThis.fetch.bind(globalThis);

  afterEach(async () => {
    if (close) await close();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("proxies chat completions to forward base", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const u = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        if (u.includes("upstream.test")) {
          expect(u).toContain("/v1/chat/completions");
          return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }
        return nativeFetch(input as Request, init);
      }),
    );

    const gw = await startOpenAiGateway({
      port: 0,
      forwardBaseUrl: "http://upstream.test",
      enableTools: false,
    });
    close = gw.close;
    const addr = gw.server.address();
    if (!addr || typeof addr === "string") throw new Error("addr");

    const res = await fetch(`http://127.0.0.1:${addr.port}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "gpt-4", messages: [] }),
    });
    expect(res.ok).toBe(true);
  });

  it("rejects tools when disabled", async () => {
    const gw = await startOpenAiGateway({
      port: 0,
      forwardBaseUrl: "http://upstream.test",
      enableTools: false,
    });
    close = gw.close;
    const addr = gw.server.address();
    if (!addr || typeof addr === "string") throw new Error("addr");
    const res = await fetch(`http://127.0.0.1:${addr.port}/v1/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ model: "gpt-4", messages: [], tools: [] }),
    });
    expect(res.status).toBe(400);
  });
});
