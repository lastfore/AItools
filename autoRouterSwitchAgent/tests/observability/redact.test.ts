import { describe, it, expect } from "vitest";
import { redactForUi, redactForPublicOutput, redactSecretStringsInText } from "../../src/observability/redact.js";

describe("redactForUi", () => {
  it("masks bearer-like strings", () => {
    expect(redactForUi({ Authorization: "Bearer sk-secret" })).toEqual({
      Authorization: "***",
    });
  });

  it("redacts nested api_key", () => {
    expect(redactForUi({ config: { api_key: "abc" } })).toEqual({
      config: { api_key: "***" },
    });
  });
});

describe("redactForPublicOutput", () => {
  it("redacts inline sk-ant key in msg string", () => {
    const input = { msg: 'error sk-ant-api03-abcdefghijklmnopqrstuvwxyz0123456789 end' };
    const out = redactForPublicOutput(input) as { msg: string };
    expect(out.msg).not.toContain("sk-ant-api03");
    expect(out.msg).toContain("***");
  });

  it("still applies key-based redaction", () => {
    expect(redactForPublicOutput({ token: "visible-would-be-bad" })).toEqual({ token: "***" });
  });
});

describe("redactSecretStringsInText", () => {
  it("replaces Bearer tokens", () => {
    expect(redactSecretStringsInText("Authorization Bearer xyz")).toBe("Authorization ***");
  });
});
