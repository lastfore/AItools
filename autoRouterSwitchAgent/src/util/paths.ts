import { mkdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";

/** 持久化根目录；测试通过 setup-sandbox 设置 ARS_HOME。 */
export function getArsHome(): string {
  const override = process.env.ARS_HOME?.trim();
  return override && override.length > 0 ? override : join(homedir(), ".ars");
}

/** JSON 行式 pino 日志目录（确保存在）。 */
export function getArsLogsDir(): string {
  const d = join(getArsHome(), "logs");
  mkdirSync(d, { recursive: true });
  return d;
}

export function getDefaultCcrConfigPath(): string {
  const override = process.env.CCR_CONFIG_PATH?.trim();
  return override && override.length > 0
    ? override
    : join(homedir(), ".claude-code-router", "config.json");
}

export function getCcSwitchDbPath(): string {
  const override = process.env.CC_SWITCH_DB_PATH?.trim();
  return override && override.length > 0
    ? override
    : join(homedir(), ".cc-switch", "data.sqlite");
}

export function getCcSwitchSettingsPath(): string {
  const override = process.env.CC_SWITCH_SETTINGS_PATH?.trim();
  return override && override.length > 0
    ? override
    : join(homedir(), ".cc-switch", "settings.json");
}
