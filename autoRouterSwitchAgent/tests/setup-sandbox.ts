/**
 * 将所有涉及持久化路径的环境变量指向仓库内 sandbox/，避免测试触碰真实 ~/.ars、CCR、cc-switch。
 */
import { mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = dirname(fileURLToPath(new URL("../", import.meta.url)));
const sandboxRoot = join(root, "sandbox");

const arsHome = join(sandboxRoot, ".ars");
const ccrDir = join(sandboxRoot, "claude-code-router");
const ccSwitchHome = join(sandboxRoot, ".cc-switch");

mkdirSync(arsHome, { recursive: true });
mkdirSync(ccrDir, { recursive: true });
mkdirSync(ccSwitchHome, { recursive: true });

process.env.ARS_HOME = arsHome;
process.env.CCR_CONFIG_PATH = join(ccrDir, "config.json");
process.env.CC_SWITCH_HOME = ccSwitchHome;
process.env.CC_SWITCH_DB_PATH = join(ccSwitchHome, "data.sqlite");
process.env.CC_SWITCH_SETTINGS_PATH = join(ccSwitchHome, "settings.json");
