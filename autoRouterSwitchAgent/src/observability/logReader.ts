import { createReadStream, existsSync } from "fs";
import { createInterface } from "readline";

export type LogQuery = {
  limit: number;
  requestId?: string;
  level?: string | number;
};

const MAX_BUFFER_LINES = 10_000;

/** 读取日志文件末尾若干条 JSON 行（MVP：整文件扫入环形缓冲上限）。 */
export async function readRecentLogs(logFile: string, q: LogQuery): Promise<unknown[]> {
  if (!existsSync(logFile)) return [];
  const limit = Math.min(Math.max(q.limit, 1), 500);
  const out: unknown[] = [];
  const stream = createReadStream(logFile, { encoding: "utf8" });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });
  const buf: string[] = [];
  try {
    for await (const line of rl) {
      if (!line.trim()) continue;
      buf.push(line);
      if (buf.length > MAX_BUFFER_LINES) buf.splice(0, buf.length - MAX_BUFFER_LINES);
    }
  } catch {
    return [];
  }
  for (let i = buf.length - 1; i >= 0 && out.length < limit; i--) {
    try {
      const j = JSON.parse(buf[i]!) as Record<string, unknown>;
      if (q.requestId && j.requestId !== q.requestId) continue;
      if (q.level !== undefined && q.level !== "") {
        const lvl = j.level;
        if (typeof q.level === "number" && lvl !== q.level) continue;
        if (typeof q.level === "string" && String(lvl) !== q.level) continue;
      }
      out.push(j);
    } catch {
      /* skip bad line */
    }
  }
  return out;
}
