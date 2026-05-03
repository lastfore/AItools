import { describe, it, expect } from "vitest";
import { evaluateCCRChannel } from "../../src/executor/channelGates.js";

describe("evaluateCCRChannel emergency", () => {
  const base = {
    emergencyPriorityThreshold: 200,
    rulePriority: 199,
    activeSessionCount: 1,
    sseInflight: false,
    hasPendingRestart: false,
    requiresRestart: false,
  };

  it("defers in InThinking when below emergency", () => {
    expect(
      evaluateCCRChannel({
        ...base,
        phase: "InThinking",
        rulePriority: 199,
      }),
    ).toBe("defer");
  });

  it("allows emergency path marker when priority >= threshold", () => {
    expect(
      evaluateCCRChannel({
        ...base,
        phase: "InThinking",
        rulePriority: 200,
      }),
    ).toBe("emergency_only");
  });

  it("InRiskyPhase defers when below emergency", () => {
    expect(
      evaluateCCRChannel({
        ...base,
        phase: "InRiskyPhase",
        rulePriority: 199,
      }),
    ).toBe("defer");
  });

  it("InRiskyPhase emergency when priority >= threshold", () => {
    expect(
      evaluateCCRChannel({
        ...base,
        phase: "InRiskyPhase",
        rulePriority: 200,
      }),
    ).toBe("emergency_only");
  });
});
