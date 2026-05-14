# autoRouterSwitchAgent 部署说明

> **读者**：在本机安装、启动 ARS daemon，并与 Claude Code Router（CCR）联调的维护者。  
> **关联文档**：[001-autoRouterSwitchAgent_design.md](./001-autoRouterSwitchAgent_design.md)（§8 配置与目录）、[E2E_M1_CHECKLIST.md](./E2E_M1_CHECKLIST.md)（验收清单）。

---

## 1. 部署形态摘要

ARS 以 **本机常驻 daemon** 形式运行，默认监听 **`127.0.0.1:3457`**（可配置）。  
Claude Code 路径下，CCR 通过 **`CUSTOM_ROUTER_PATH`** 加载编译后的 **`ars-router.js` shim**；shim 将路由决策转发给 daemon。**不得**将 daemon 暴露到公网。

---

## 2. 前置条件

| 项 | 说明 |
|----|------|
| Node.js | 建议使用 **20+**（与 `@types/node` 版本相容即可）。 |
| pnpm | 用于安装依赖与构建。 |
| 原生模块 | `better-sqlite3` 需在安装时本机编译；请保证已安装对应平台的构建工具链（Windows 常见为 VS Build Tools）。 |
| CCR | 已能独立运行，且 **HTTP 地址 / 健康检查路径** 与 `config.yaml` 中 `daemon.ccr_url`、`daemon.ccr_health_path` 一致。 |

---

## 3. 构建

在仓库内进入子项目目录：

```bash
cd autoRouterSwitchAgent
pnpm install
pnpm run build
```

产物要点：

- CLI：`dist/cli/index.js`（包内 `bin` 字段名为 `ars`）
- CCR shim：`dist/shim/ars-router.js`（供 `CUSTOM_ROUTER_PATH` 引用）

---

## 4. CLI 安装方式（任选其一）

**方式 A — 仅在本仓库内使用**

```bash
node dist/cli/index.js start -c "%USERPROFILE%\.ars\config.yaml"
```

（Linux / macOS 将路径换为 `$HOME/.ars/config.yaml`。）

**方式 B — 全局 `ars` 命令**

在 `autoRouterSwitchAgent` 目录执行：

```bash
pnpm link --global
```

之后可直接使用 `ars start`、`ars stop` 等（依赖已正确写入 `package.json` 的 `bin` 字段）。

---

## 5. 目录与配置文件

默认数据根目录为 **`~/.ars/`**（Windows 为 **`%USERPROFILE%\.ars`**），可通过环境变量 **`ARS_HOME`** 覆盖。

推荐布局（与设计文档 §8 一致）：

```
~/.ars/
├── config.yaml      # 主配置
├── rules.yaml       # 规则链（路径由 config.yaml 的 rules_file 指定）
├── state.db         # SQLite（指标、sticky、审计）
├── logs/            # pino JSON 日志
├── ars.pid          # 运行中进程号（由 start 写入）
└── backups/         # CCR / profile 备份（运行时生成）
```

### 5.1 最小 `config.yaml` 示例

字段以代码实现中的 zod schema 为准（见 `src/config/schema.ts`）。最小示例如下：

```yaml
daemon:
  http_port: 3457
  ccr_url: http://127.0.0.1:3456
  ccr_health_path: /health
  log_level: info

safety_gate:
  emergency_priority: 200
  sticky_ttl_seconds: 600
  freeze_period_seconds: 300

provider_chains:
  default: ["anthropic-official"]

rules_file: ~/.ars/rules.yaml
```

`rules_file` 可使用绝对路径； **`provider_chains` 的键名须与你的规则中引用一致**。更完整的示例与设计说明见 [001-autoRouterSwitchAgent_design.md](./001-autoRouterSwitchAgent_design.md) §8。

### 5.2 规则文件

在 `rules_file` 指向的路径放置规则 YAML/JSON（具体语法见实现与 [002-autoRouterSwitchAgent_plan.md](./002-autoRouterSwitchAgent_plan.md)）。启动期校验失败时进程应拒绝启动。

---

## 6. 启动与停止

```bash
ars start -c ~/.ars/config.yaml
# 成功时输出监听端口；PID 写入 ~/.ars/ars.pid
```

```bash
ars status
ars stop
```

- 在 **Windows** 上，`stop` 在 `SIGTERM` 不适用时会回退到 `taskkill`（见 CLI 实现）。
- 修改配置后可用 **`ars reload -c <path>`** 重新加载规则与配置（无需重启进程；若实现有特例以代码为准）。

---

## 7. 与 Claude Code Router 集成

编辑 **`~/.claude-code-router/config.json`**（或通过环境变量 **`CCR_CONFIG_PATH`** 指向的替代路径），增加或修改：

```json
{
  "CUSTOM_ROUTER_PATH": "C:\\path\\to\\autoRouterSwitchAgent\\dist\\shim\\ars-router.js"
}
```

请改为本机 **`autoRouterSwitchAgent` 仓库内 `dist/shim/ars-router.js` 的绝对路径**（Windows 在 JSON 中需转义反斜杠）。Linux / macOS 示例：`"/home/you/AItools/autoRouterSwitchAgent/dist/shim/ars-router.js"`。

**须先启动 ARS daemon**，再启动 CCR；shim 通过 **`ARS_DAEMON_URL`** 连接 daemon，默认为 **`http://127.0.0.1:3457`**。若修改了 `daemon.http_port`，请同步设置环境变量或保证默认值仍可用。

---

## 8. 环境变量一览

| 变量 | 作用 |
|------|------|
| `ARS_HOME` | 覆盖默认 `~/.ars`，用于状态库、日志、默认 config 路径等。 |
| `ARS_DAEMON_URL` | shim 调用 daemon 的基址（默认 `http://127.0.0.1:3457`）。 |
| `CCR_CONFIG_PATH` | 覆盖默认 `~/.claude-code-router/config.json`（CCR 热改通道读取）。 |
| `CC_SWITCH_DB_PATH` | 覆盖默认 `~/.cc-switch/data.sqlite`。 |
| `CC_SWITCH_SETTINGS_PATH` | 覆盖默认 `~/.cc-switch/settings.json`。 |

---

## 9. 可选：内置 OpenAI 兼容网关

当 `config.yaml` 中配置了 `gateway.forward_base_url` 等字段时，可使用：

```bash
ars gateway -c ~/.ars/config.yaml
```

默认端口以配置为准（schema 中 `http_port` 默认 **3458**）。用于 Codex/OpenCode 将 `OPENAI_BASE_URL` 指向本机 ARS 网关的设计目标见设计文档 §3、§10（M3）。若未配置 `forward_base_url`，命令会报错退出。

---

## 10. 可观测性与 Web UI

- **文件日志**：`$ARS_HOME/logs/` 下 pino JSON。
- **审计回放**：`ars explain <decisionId>`，数据与同目录下 SQLite 审计表一致。
- **本机 HTTP**：daemon 端口（默认 3457）提供只读 API 与静态观测页；字段与边界见 [003-log-visualization-spec.md](./003-log-visualization-spec.md)。

---

## 11. 升级与回滚

1. `ars stop`。
2. 拉取新版本后在该目录执行 `pnpm install && pnpm run build`。
3. 检查 `config.yaml` / 规则是否与新版本 schema 兼容（启动失败时阅读控制台 zod 报错）。
4. `ars start`；若 CCR 已加载旧 shim，必要时重启 CCR 进程以加载新 `ars-router.js`。

建议在升级前备份 **`~/.ars/state.db`** 与 **`~/.claude-code-router/config.json`**。

---

## 12. 常见问题

| 现象 | 排查方向 |
|------|-----------|
| shim 超时或始终走默认链 | 确认 daemon 已启动、`ARS_DAEMON_URL` 与端口一致、防火墙未拦本机回环。 |
| CCR 健康检查失败 | `ccr_health_path` 是否与真实 CCR 一致（常见为 `/health`）。 |
| `better-sqlite3` 安装失败 | 检查 Node 版本与 MSVC/Python 等构建依赖。 |
| Windows 无法 `stop` | 查看 `ars.pid` 是否残留、进程是否已手动结束；必要时任务管理器结束进程后删除 `ars.pid`。 |

---

## 13. 相关文档索引

| 文档 | 内容 |
|------|------|
| [001-autoRouterSwitchAgent_design.md](./001-autoRouterSwitchAgent_design.md) | 架构、SafetyGate、配置约定 |
| [002-autoRouterSwitchAgent_plan.md](./002-autoRouterSwitchAgent_plan.md) | 实现任务与模块划分 |
| [003-log-visualization-spec.md](./003-log-visualization-spec.md) | 路由日志 Web UI 与只读 API |
| [004-log-visualization-implementation-plan.md](./004-log-visualization-implementation-plan.md) | 可视化实现计划 |
| [E2E_M1_CHECKLIST.md](./E2E_M1_CHECKLIST.md) | Claude Code 端到端手工验收 |
