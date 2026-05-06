import pino from "pino";
import { createWriteStream } from "fs";
import { join } from "path";

export function createLogger(level: string = "info") {
  return pino({ level });
}

/** 文件 JSON + stderr 多路；日志路径由调用方传入（通常 ~/.ars/logs/ars.log）。 */
export function createDaemonLogger(level: string, logFilePath: string) {
  const fileStream = createWriteStream(logFilePath, { flags: "a" });
  return pino(
    { level },
    pino.multistream([
      { stream: fileStream },
      { stream: process.stderr },
    ]),
  );
}

export function defaultArsLogPath(logsDir: string): string {
  return join(logsDir, "ars.log");
}
