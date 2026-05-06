const SENSITIVE_KEY = /^(authorization|api[_-]?key|token|secret|password|bearer)$/i;

/** OpenAI/Anthropic 常见前缀与 Bearer；避免误伤短随机串，长度阈值与关键字并用。 */
const INLINE_SECRET_PATTERNS: RegExp[] = [
  /\bBearer\s+\S+/gi,
  /\bsk-ant-[a-zA-Z0-9_-]{8,}\b/g,
  /\bsk-proj-[a-zA-Z0-9_-]{8,}\b/g,
  /\bsk-[a-zA-Z0-9]{20,}\b/g,
];

export function redactSecretStringsInText(s: string): string {
  let out = s;
  for (const re of INLINE_SECRET_PATTERNS) {
    out = out.replace(re, "***");
  }
  return out;
}

export function redactForUi(input: unknown): unknown {
  if (input === null || typeof input !== "object") return input;
  if (Array.isArray(input)) return input.map(redactForUi);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (SENSITIVE_KEY.test(k)) {
      out[k] = "***";
    } else if (typeof v === "object" && v !== null) {
      out[k] = redactForUi(v);
    } else if (typeof v === "string" && /^Bearer\s+/i.test(v)) {
      out[k] = "***";
    } else {
      out[k] = v;
    }
  }
  return out;
}

function redactStringLeaves(input: unknown): unknown {
  if (typeof input === "string") return redactSecretStringsInText(input);
  if (Array.isArray(input)) return input.map(redactStringLeaves);
  if (input !== null && typeof input === "object") {
    const o = input as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(o)) {
      out[k] = redactStringLeaves(v);
    }
    return out;
  }
  return input;
}

/** 审计 JSON、CLI explain、HTTP API 统一：键级脱敏 + 字符串内联密钥模式。 */
export function redactForPublicOutput(input: unknown): unknown {
  return redactStringLeaves(redactForUi(input));
}
