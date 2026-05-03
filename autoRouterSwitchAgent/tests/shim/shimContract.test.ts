import { describe, it, expect, vi, afterEach } from "vitest";

describe("shim contract", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("calls daemon with timeout and falls back to null", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
        await new Promise<void>((resolve, reject) => {
          const t = setTimeout(resolve, 50);
          init?.signal?.addEventListener("abort", () => {
            clearTimeout(t);
            reject(new Error("aborted"));
          });
        });
        return new Response(JSON.stringify({ route: "p,m" }), { status: 200 });
      }),
    );
    const { decideViaDaemon } = await import("../../src/shim/ars-router.js");
    const out = await decideViaDaemon(
      { sessionId: "sess", features: { tokenCount: 1 } },
      { url: "http://127.0.0.1:9", timeoutMs: 5 },
    );
    expect(out).toBeNull();
  });
});
