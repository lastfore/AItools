import { readFile, writeFile, rename, copyFile } from "fs/promises";
import { dirname, join } from "path";

export type CcrConfigShape = {
  Router?: Record<string, string>;
  HOST?: string;
  PORT?: number;
  [key: string]: unknown;
};

export type CcrChannelOptions = {
  configPath: string;
  ccrBaseUrl: string;
  healthPath: string;
};

async function readJson(path: string): Promise<CcrConfigShape> {
  const raw = await readFile(path, "utf8");
  return JSON.parse(raw) as CcrConfigShape;
}

async function atomicWriteJson(path: string, data: unknown) {
  const dir = dirname(path);
  const tmp = join(dir, `.ars-tmp-${Date.now()}.json`);
  await writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await rename(tmp, path);
}

export async function backupIfExists(configPath: string): Promise<string | null> {
  try {
    const bak = `${configPath}.ars.bak`;
    await copyFile(configPath, bak);
    return bak;
  } catch {
    return null;
  }
}

export async function applyCcrRouterDefault(
  opts: CcrChannelOptions,
  routerKey: string,
  route: string,
): Promise<void> {
  await backupIfExists(opts.configPath);
  const cfg = await readJson(opts.configPath);
  const router = { ...(typeof cfg.Router === "object" && cfg.Router !== null ? cfg.Router : {}) };
  router[routerKey] = route;
  cfg.Router = router;
  await atomicWriteJson(opts.configPath, cfg);
  await triggerCcrRestart(opts);
  await waitForCcrHealthy(opts);
}

export async function triggerCcrRestart(opts: CcrChannelOptions): Promise<void> {
  const url = new URL("/api/restart", opts.ccrBaseUrl).toString();
  const res = await fetch(url, { method: "POST" });
  if (!res.ok) {
    throw new Error(`CCR restart failed: ${res.status}`);
  }
}

export async function waitForCcrHealthy(opts: CcrChannelOptions, maxAttempts = 30, delayMs = 50) {
  const base = opts.ccrBaseUrl.replace(/\/$/, "");
  const path = opts.healthPath.startsWith("/") ? opts.healthPath : `/${opts.healthPath}`;
  const url = `${base}${path}`;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, delayMs));
  }
  throw new Error("CCR health check timeout");
}
