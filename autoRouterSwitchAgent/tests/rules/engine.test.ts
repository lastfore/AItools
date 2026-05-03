import { describe, it, expect } from "vitest";
import { RuleEngine } from "../../src/rules/engine.js";
import type { RulesFile } from "../../src/rules/schema.js";

describe("RuleEngine", () => {
  it("picks highest priority matching rule", () => {
    const file: RulesFile = {
      rules: [
        {
          name: "low",
          when: { request_tokenCount: ">10" },
          action: { type: "ccr_route", route: "a" },
          priority: 1,
        },
        {
          name: "high",
          when: { request_tokenCount: ">5" },
          action: { type: "ccr_route", route: "b" },
          priority: 100,
        },
      ],
    };
    const engine = new RuleEngine(file);
    const win = engine.evaluate({
      request_tokenCount: 20,
      phase: "Idle",
    });
    expect(win?.rule.name).toBe("high");
    expect(win?.action).toEqual({ type: "ccr_route", route: "b" });
  });
});
