import Database from "better-sqlite3";
import { readFile, writeFile, rename } from "fs/promises";
import { dirname, join } from "path";

export type ProfileChannelOptions = {
  /** cc-switch SQLite（providers 表） */
  dbPath: string;
  /** 设备级 settings.json 路径（与 cc-switch 一致，camelCase） */
  settingsPath: string;
  appType?: string;
};

async function atomicWriteText(path: string, content: string) {
  const dir = dirname(path);
  const tmp = join(dir, `.ars-settings-${Date.now()}.tmp`);
  await writeFile(tmp, content, "utf8");
  await rename(tmp, path);
}

/** 与 cc-switch `Database::set_current_provider` 对齐的事务语义。 */
export function setCurrentProviderTx(dbPath: string, appType: string, providerId: string) {
  const db = new Database(dbPath);
  try {
    const tx = db.transaction(() => {
      db.prepare("UPDATE providers SET is_current = 0 WHERE app_type = ?").run(appType);
      const info = db
        .prepare("UPDATE providers SET is_current = 1 WHERE id = ? AND app_type = ?")
        .run(providerId, appType);
      if (info.changes === 0) {
        throw new Error(`provider not found: ${providerId} (${appType})`);
      }
    });
    tx();
  } finally {
    db.close();
  }
}

/** 合并写入 current_provider_claude（优先字段），并原子落盘。 */
export async function writeDeviceCurrentProvider(
  settingsPath: string,
  appType: "claude" | "codex" | "gemini",
  providerId: string,
) {
  let existing: Record<string, unknown> = {};
  try {
    existing = JSON.parse(await readFile(settingsPath, "utf8")) as Record<string, unknown>;
  } catch {
    existing = {};
  }
  const key =
    appType === "claude"
      ? "currentProviderClaude"
      : appType === "codex"
        ? "currentProviderCodex"
        : "currentProviderGemini";
  existing[key] = providerId;
  await atomicWriteText(settingsPath, JSON.stringify(existing, null, 2));
}

export async function applyProfileSwitch(opts: ProfileChannelOptions, providerId: string) {
  const app = opts.appType ?? "claude";
  setCurrentProviderTx(opts.dbPath, app, providerId);
  if (app === "claude") {
    await writeDeviceCurrentProvider(opts.settingsPath, "claude", providerId);
  } else if (app === "codex") {
    await writeDeviceCurrentProvider(opts.settingsPath, "codex", providerId);
  } else if (app === "gemini") {
    await writeDeviceCurrentProvider(opts.settingsPath, "gemini", providerId);
  }
}
