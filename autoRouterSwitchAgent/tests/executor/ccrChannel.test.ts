import { describe, it, expect, vi, afterEach } from "vitest";
import { applyCcrRouterDefault } from "../../src/executor/ccrChannel.js";
import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { dirname } from "path";

describe("CCRChannel", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("patches Router.default, restarts, waits for health", async () => {
    const path = process.env.CCR_CONFIG_PATH!;
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(
      path,
      JSON.stringify({
        HOST: "127.0.0.1",
        PORT: 3456,
        Router: { default: "a,b" },
      }),
      "utf8",
    );

    const calls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo |URL, init?: RequestInit) => {
        const u = typeof input === "string" ? input : input.toString();
        calls.push(`${init?.method ?? "GET"} ${u}`);
        if (u.includes("/api/restart")) return new Response(null, { status: 200 });
        if (u.endsWith("/health")) return new Response("ok", { status: 200 });
        return new Response("nope", { status: 404 });
      }),
    );

    await applyCcrRouterDefault(
      {
        configPath: path,
        ccrBaseUrl: "http://127.0.0.1:9",
        healthPath: "/health",
      },
      "default",
      "moonshot,kimi-k2.5",
    );

    const cfg = JSON.parse(readFileSync(path, "utf8")) as { Router: { default: string } };
    expect(cfg.Router.default).toBe("moonshot,kimi-k2.5");
    expect(calls.some((c) => c.includes("POST") && c.includes("/api/restart"))).toBe(true);
    expect(calls.some((c) => c.includes("/health"))).toBe(true);
  });
});
