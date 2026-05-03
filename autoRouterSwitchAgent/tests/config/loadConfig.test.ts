import { describe, it, expect } from "vitest";
import { loadConfigFromFile } from "../../src/config/loadConfig.js";
import { writeFileSync, mkdirSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

describe("loadConfigFromFile", () => {
  it("parses minimal daemon config", async () => {
    const dir = join(tmpdir(), `ars-cfg-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    const p = join(dir, "config.yaml");
    writeFileSync(
      p,
      `
daemon:
  http_port: 3457
  ccr_url: http://127.0.0.1:3456
  ccr_health_path: /health
  log_level: info
safety_gate:
  emergency_priority: 200
  sticky_ttl_seconds: 600
  freeze_period_seconds: 300
provider_chains:
  default: ["anthropic-official"]
rules_file: ${join(dir, "rules.yaml").replace(/\\/g, "/")}
`,
      "utf8",
    );
    const c = await loadConfigFromFile(p);
    expect(c.daemon.http_port).toBe(3457);
    expect(c.safety_gate.emergency_priority).toBe(200);
  });
});
