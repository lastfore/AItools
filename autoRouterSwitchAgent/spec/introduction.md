## design

参考 @reference\research\ 目录下的调研文档，帮我生成一个 md 格式的设计文档，其中的图表使用 mermaid 绘制，放在 @autoRouterSwitchAgent\spec\ 目录下，文档的标题为 `autoRouterSwitchAgent_design.md`

## plan
/write-plan  @autoRouterSwitchAgent/spec/001-autoRouterSwitchAgent_design.md 根据设计文档，生成一个 md 格式的计划文档，图表使用 mermaid 绘制，命名为 `002-autoRouterSwitchAgent_plan.md` ，放在 @autoRouterSwitchAgent/spec/ 目录下。

## log

实现一个路由日志数据的可视化方案，通过 **web UI** 展示原始消息、CCR 路由、ARS 决策、LLM 回复摘要、cc-switch 配置写入等信息；数据来自 **pino JSON**（`~/.ars/logs/`）、**SQLite 审计表**（与 `ars explain <decisionId>` 同源）、以及可选的 CCR/cc-switch 侧日志。

**完整规格（关联键、脱敏、五面板字段 MVP/可选、3457 只读 API、与 M4 对齐）见：** [003-log-visualization-spec.md](./003-log-visualization-spec.md)。

### 概要：追踪链

用统一关联键串联 **`requestId` → `sessionId` → `decisionId`**（辅以时间戳兜底），在 UI 中形成「原始请求 → CCR 路由 → ARS 决策 → LLM 回复 → cc-switch 写入」一条链。

### 一、原始消息相关

Agent CLI / 网关入口请求的形态：**体量与 token**、**请求特征**（长上下文 / thinking / tool_use / Plan，推断时与 InRiskyPhase 一致）、**会话 id**、脱敏后的可折叠 JSON。

### 二、CCR 路由情况

shim 入参与返回值（`provider,model` 或默认链）、上游错误码；可选接入 CCR restart 等进程侧事件。

### 三、autoRouterSwitchAgent 决策情况

与 **`ars explain`** 对齐：信号快照、规则匹配、**SafetyGate** 双维结论、sticky/cooldown、`decisionId` 与审计写入。

### 四、LLM 回复情况

MVP：**HTTP 级耗时与成败**、摘要级 finish_reason/tool_calls；完整 SSE 正文为可选（受设计 §4.6 边界约束）。

### 五、cc-switch 情况

ProfileChannel：**目标 profile**、影响的配置文件路径、原子写结果、GlobalProfileImpact / EffectiveApply 相关提示。

---
