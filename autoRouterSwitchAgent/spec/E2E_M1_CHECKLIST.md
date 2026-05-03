# M1 E2E 手工清单（Claude Code）

本清单用于在真实环境中验收 ARS + CCR + cc-switch 的串联行为；自动化测试已在 `sandbox/` 与临时目录中运行，不依赖本机 `~/.ars`。

1. **构建与启动 daemon**  
   在 `autoRouterSwitchAgent` 目录执行 `pnpm install`、`pnpm run build`，然后使用真实配置文件执行 `ars start -c <你的 config.yaml>`（仅当你明确要在本机常驻进程时执行；日常验证可继续仅跑 `pnpm test`）。

2. **挂接 CUSTOM_ROUTER_PATH**  
   在 `~/.claude-code-router/config.json` 中设置 `"CUSTOM_ROUTER_PATH"` 指向本仓库构建产物 `dist/ars-router.js`（或等价绝对路径）。确保 `ARS_DAEMON_URL` 与 daemon 监听一致（默认 `http://127.0.0.1:3457`）。

3. **长上下文路由**  
   发送约 70k token 的 prompt：在规则与 `provider_chains` 已配置的前提下，验证长上下文规则会切换到备选 CCR 路由（需上游 provider 可用）。

4. **429 / 错误与相位**  
   通过 mock 上游或测试夹具注入 HTTP 429：在相位不可观测时（策略 A），流中途切换为**尽力而为**验收 —— 预期不应在不安全相位强行改写 CCR；可结合 `ars explain <decisionId>` 查看审计记录。

5. **回归**  
   停止 daemon：`ars stop`；确认 `ars status` 为非 0 或未运行提示。
