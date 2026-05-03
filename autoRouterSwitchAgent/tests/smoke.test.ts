import { describe, it, expect } from "vitest";
import { createLogger } from "../src/logging/logger.js";

describe("smoke", () => {
  it("creates logger", () => {
    expect(createLogger("silent").level).toBe("silent");
  });
});
