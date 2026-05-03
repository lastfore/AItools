#!/usr/bin/env node
import { Command } from "commander";
import { startDaemonServer } from "../daemon/httpServer.js";
import { writeFileSync, readFileSync, unlinkSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import { getArsHome, getDefaultCcrConfigPath } from "../util/paths.js";
import { setDecideContext } from "../daemon/decideHandler.js";
import { StateStore } from "../store/stateStore.js";
import { execSync } from "node:child_process";

function pidPath() {
  const home = getArsHome();
  mkdirSync(home, { recursive: true });
  return join(home, "ars.pid");
}

async function loadRuntime(config: Awaited<ReturnType<typeof import("../config/loadConfig.js").loadConfigFromFile>>) {
  const { loadRulesFromFile } = await import("../rules/loadRules.js");
  const rules = await loadRulesFromFile(config.rules_file);
  const dbPath = join(getArsHome(), "state.db");
  const store = new StateStore(dbPath);
  setDecideContext({
    config,
    store,
    rules,
    ccrConfigPath: getDefaultCcrConfigPath(),
  });
}

const program = new Command();
program.name("ars").description("autoRouterSwitchAgent CLI");

program
  .command("start")
  .option("-c, --config <path>", "配置文件路径", join(getArsHome(), "config.yaml"))
  .action(async (opts) => {
    mkdirSync(getArsHome(), { recursive: true });
    const { loadConfigFromFile } = await import("../config/loadConfig.js");
    const cfg = await loadConfigFromFile(opts.config);
    await loadRuntime(cfg);
    const { close } = await startDaemonServer({
      port: cfg.daemon.http_port,
      host: "127.0.0.1",
    });
    const pid = process.pid;
    writeFileSync(pidPath(), String(pid), "utf8");
    console.log(`ars daemon 监听端口 ${cfg.daemon.http_port}`);

    const shutdown = async () => {
      await close();
      try {
        unlinkSync(pidPath());
      } catch {
        /* ignore */
      }
      process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    await new Promise(() => {});
  });

program
  .command("stop")
  .action(() => {
    try {
      const pid = Number(readFileSync(pidPath(), "utf8").trim());
      if (!Number.isFinite(pid) || pid <= 0) throw new Error("bad pid");
      try {
        process.kill(pid, "SIGTERM");
      } catch {
        if (process.platform === "win32") {
          execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
        } else {
          throw new Error("stop failed");
        }
      }
      try {
        unlinkSync(pidPath());
      } catch {
        /* ignore */
      }
      console.log(`已发送停止信号 pid=${pid}`);
    } catch {
      console.error("未找到 PID 或无法停止");
      process.exitCode = 1;
    }
  });

program
  .command("status")
  .action(() => {
    try {
      const pid = readFileSync(pidPath(), "utf8").trim();
      console.log(`运行中 pid=${pid}`);
    } catch {
      console.log(`未运行`);
      process.exitCode = 1;
    }
  });

program
  .command("reload")
  .option("-c, --config <path>", "配置文件路径", join(getArsHome(), "config.yaml"))
  .action(async (opts) => {
    const { loadConfigFromFile } = await import("../config/loadConfig.js");
    const cfg = await loadConfigFromFile(opts.config);
    await loadRuntime(cfg);
    console.log("已重新加载规则与配置");
  });

program
  .command("explain")
  .argument("<id>", "决策 id")
  .action(async (id) => {
    const { StateStore } = await import("../store/stateStore.js");
    const path = join(getArsHome(), "state.db");
    if (!existsSync(path)) {
      console.error("state.db 不存在");
      process.exitCode = 1;
      return;
    }
    const s = new StateStore(path);
    const row = s.getAudit(id);
    console.log(JSON.stringify(row ?? null, null, 2));
    s.close();
  });

program
  .command("gateway")
  .description("启动最小 OpenAI 网关（默认 3458）")
  .option("-c, --config <path>", "配置文件路径", join(getArsHome(), "config.yaml"))
  .action(async (opts) => {
    const { loadConfigFromFile } = await import("../config/loadConfig.js");
    const cfg = await loadConfigFromFile(opts.config);
    const g = cfg.gateway;
    if (!g?.forward_base_url) {
      console.error("config.gateway.forward_base_url 未设置");
      process.exitCode = 1;
      return;
    }
    const { startOpenAiGateway } = await import("../gateway/openaiGateway.js");
    const { close } = await startOpenAiGateway({
      port: g.http_port,
      forwardBaseUrl: g.forward_base_url,
      enableTools: g.enable_tools,
    });
    console.log(`OpenAI gateway 监听 ${g.http_port}`);
    const shutdown = async () => {
      await close();
      process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
    await new Promise(() => {});
  });

program.parseAsync(process.argv);
