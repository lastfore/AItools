# 路由日志 Web 可视化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the MVP described in [003-log-visualization-spec.md](./003-log-visualization-spec.md): read-only REST on the daemon (`127.0.0.1`, default port from config), JSON audit listing/detail sharing `StateStore.getAudit` with `ars explain`, pino JSON log pagination from `~/.ars/logs/`, redacted payloads, and a minimal static single-page UI under `public/`.

**Architecture:** Extend Fastify in [`src/daemon/httpServer.ts`](../src/daemon/httpServer.ts) with registered routes and `@fastify/static` for `public/`. Add thin modules for **audit queries** (reuse SQLite schema; enrich `detail_json` with `sessionId` / `requestId` at write time), **line-delimited log tail** (read reverse or seek-based pagination), and **redaction** before any HTTP response. Structured fields are logged via pino child loggers in [`src/daemon/decideHandler.ts`](../src/daemon/decideHandler.ts) once file logging exists.

**Tech Stack:** TypeScript, Fastify 5, better-sqlite3, pino, Vitest, `@fastify/static` (add dependency).

---

## 实施记录（与仓库同步）

| 区块 | 状态 | 说明 |
|------|------|------|
| Task 1–4 | 已完成 | `listAudit`、审计 `detail_json` 关联键、`/api/*`、`public/`、文件日志、`logReader` |
| Task 5 | 已完成 | 003 顶部已链到本计划 |
| **日志脱敏增强** | 已完成 | [`redactForPublicOutput`](../src/observability/redact.ts)：在 `redactForUi` 基础上对**字符串叶子**匹配 `Bearer`、`sk-ant-`、`sk-proj-`、`sk-{20+}`；`/api/logs` 每条记录经此处理 |
| **`ars explain` 格式** | 已完成 | 输出与 `GET /api/audit/:id` 一致：解析 `detail_json` 为 `detail` 对象，经 `redactForPublicOutput`；实现见 [`auditDisplay.ts`](../src/observability/auditDisplay.ts) |

**后续可选（仍不在 MVP）：** `listAudit` 的 `cursor` 分页；003「五面板」完整 UI；超大 `ars.log` 反向 seek 读取。

---

## File map (new / touched)

| Path | Responsibility |
|------|----------------|
| [`src/store/stateStore.ts`](../src/store/stateStore.ts) | `listAudit()` pagination + filters; keep `getAudit()` as single source for explain + `GET /api/audit/:id` |
| [`src/daemon/decideHandler.ts`](../src/daemon/decideHandler.ts) | Per-decision `requestId`; embed `sessionId` / `requestId` in every `appendAudit` `detail_json`; log structured lines via logger |
| [`src/logging/logger.ts`](../src/logging/logger.ts) | Optional `createFileLogger` / multistream to `~/.ars/logs/ars.log` (JSON lines) |
| [`src/cli/index.ts`](../src/cli/index.ts) | Instantiate file logger on `start`, pass into runtime / decide context if needed |
| [`src/daemon/httpServer.ts`](../src/daemon/httpServer.ts) | Register API + static; inject `StateStore` path + log directory via new opts |
| `src/observability/redact.ts` | `redactForUi`、`redactForPublicOutput`（键名 + 字符串内联密钥） |
| `src/observability/auditDisplay.ts` | `formatAuditRowForDisplay`：`ars explain` 与 `/api/audit*` 共用 |
| `src/observability/logReader.ts` | Parse JSON lines from log file, filter by `requestId` / `level`, cursor pagination |
| `src/daemon/observabilityApi.ts` | Fastify plugin or plain route builders returning handlers (keeps `httpServer.ts` small) |
| `public/index.html` | Minimal UI: audit table, detail drawer, log tail, query params for correlation |
| [`tests/daemon/httpServer.test.ts`](../tests/daemon/httpServer.test.ts) | Extend with `/api/audit`, `/api/logs`, static `GET /` |
| [`tests/store/stateStore.test.ts`](../tests/store/stateStore.test.ts) | `listAudit` ordering and filters |
| [`tests/observability/auditDisplay.test.ts`](../tests/observability/auditDisplay.test.ts) | `formatAuditRowForDisplay` |

---

### Task 1: Audit row enrichment + `StateStore.listAudit`

**Files:**
- Modify: [`src/store/stateStore.ts`](../src/store/stateStore.ts)
- Modify: [`src/daemon/decideHandler.ts`](../src/daemon/decideHandler.ts)
- Test: [`tests/store/stateStore.test.ts`](../tests/store/stateStore.test.ts)

- [ ] **Step 1: Write failing test for `listAudit`**

Add to `tests/store/stateStore.test.ts` (use temp DB path like existing patterns):

```typescript
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { StateStore } from "../../src/store/stateStore.js";

describe("StateStore listAudit", () => {
  let dir: string;
  let dbPath: string;
  let store: StateStore;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "ars-list-audit-"));
    dbPath = join(dir, "state.db");
    store = new StateStore(dbPath);
    store.appendAudit({
      id: "a1",
      matched_rule: "r1",
      gate_outcome: "allow",
      detail_json: JSON.stringify({ sessionId: "sess1", requestId: "req1" }),
    });
    store.appendAudit({
      id: "a2",
      matched_rule: null,
      gate_outcome: "defer",
      detail_json: JSON.stringify({ sessionId: "sess2", reason: "x" }),
    });
  });

  afterEach(() => {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  });

  it("lists newest first with limit", () => {
    const rows = store.listAudit({ limit: 10 });
    expect(rows.length).toBe(2);
    expect(rows[0].id).toBe("a2");
  });

  it("filters by json sessionId", () => {
    const rows = store.listAudit({ limit: 10, sessionId: "sess1" });
    expect(rows.map((r) => r.id)).toEqual(["a1"]);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `pnpm exec vitest run tests/store/stateStore.test.ts -t listAudit`

Expected: FAIL (`listAudit` not defined).

- [ ] **Step 3: Implement `listAudit` on `StateStore`**

Add method and types to [`src/store/stateStore.ts`](../src/store/stateStore.ts):

```typescript
export type ListAuditOpts = {
  limit: number;
  cursor?: string; // id of last row from previous page (exclusive), optional MVP: offset via id
  fromEpochMs?: number;
  toEpochMs?: number;
  sessionId?: string;
};

export class StateStore {
  // ...existing...

  listAudit(opts: ListAuditOpts): AuditRow[] {
    const limit = Math.min(Math.max(opts.limit, 1), 500);
    const conditions: string[] = ["1=1"];
    const params: unknown[] = [];
    if (opts.fromEpochMs != null) {
      conditions.push("created_epoch_ms >= ?");
      params.push(opts.fromEpochMs);
    }
    if (opts.toEpochMs != null) {
      conditions.push("created_epoch_ms <= ?");
      params.push(opts.toEpochMs);
    }
    if (opts.sessionId) {
      conditions.push("json_extract(detail_json, '$.sessionId') = ?");
      params.push(opts.sessionId);
    }
    const where = conditions.join(" AND ");
    const sql = `SELECT id, created_epoch_ms, matched_rule, gate_outcome, detail_json
      FROM audit WHERE ${where}
      ORDER BY created_epoch_ms DESC LIMIT ?`;
    params.push(limit);
    const stmt = this.db.prepare(sql);
    return stmt.all(...params) as AuditRow[];
  }
}
```

- [ ] **Step 4: Enrich `detail_json` with `sessionId` and `requestId` in `decideHandler`**

At the start of `handleDecideWithDeps`, after `const decisionId = randomUUID();`, add:

```typescript
const requestId = randomUUID();
```

Replace each `JSON.stringify(...)` passed to `appendAudit` so the object includes `sessionId: deps.sessionId ?? null`, `requestId`, and preserves existing fields (e.g. `{ reason: "no_rule", sessionId, requestId }`).

- [ ] **Step 5: Run tests**

Run: `pnpm exec vitest run tests/store/stateStore.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add autoRouterSwitchAgent/src/store/stateStore.ts autoRouterSwitchAgent/src/daemon/decideHandler.ts autoRouterSwitchAgent/tests/store/stateStore.test.ts
git commit -m "feat(ars): listAudit + enrich audit detail_json with sessionId/requestId"
```

---

### Task 2: Redaction helper

**Files:**
- Create: `autoRouterSwitchAgent/src/observability/redact.ts`
- Create: `autoRouterSwitchAgent/tests/observability/redact.test.ts`

- [ ] **Step 1: Failing test**

```typescript
import { describe, it, expect } from "vitest";
import { redactForUi } from "../../src/observability/redact.js";

describe("redactForUi", () => {
  it("masks bearer-like strings", () => {
    expect(redactForUi({ Authorization: "Bearer sk-secret" })).toEqual({
      Authorization: "***",
    });
  });

  it("redacts nested api_key", () => {
    expect(redactForUi({ config: { api_key: "abc" } })).toEqual({
      config: { api_key: "***" },
    });
  });
});
```

- [ ] **Step 2: Run — expect FAIL**

Run: `pnpm exec vitest run tests/observability/redact.test.ts`

- [ ] **Step 3: Implement**

Create `src/observability/redact.ts`:

```typescript
const SENSITIVE_KEY = /^(authorization|api[_-]?key|token|secret|password|bearer)$/i;

export function redactForUi(input: unknown): unknown {
  if (input === null || typeof input !== "object") return input;
  if (Array.isArray(input)) return input.map(redactForUi);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    if (SENSITIVE_KEY.test(k)) {
      out[k] = "***";
    } else if (typeof v === "object" && v !== null) {
      out[k] = redactForUi(v);
    } else if (typeof v === "string" && /^Bearer\s+/i.test(v)) {
      out[k] = "***";
    } else {
      out[k] = v;
    }
  }
  return out;
}
```

Adjust tests if implementation adds path shortening (optional second export `shortenHomePaths`).

- [ ] **Step 4: Run tests — PASS**

- [ ] **Step 5: Commit**

```bash
git add autoRouterSwitchAgent/src/observability/redact.ts autoRouterSwitchAgent/tests/observability/redact.test.ts
git commit -m "feat(ars): redactForUi for observability API responses"
```

---

### Task 3: JSON log file reader + pino file logging

**Files:**
- Modify: [`src/logging/logger.ts`](../src/logging/logger.ts)
- Modify: [`src/cli/index.ts`](../src/cli/index.ts)
- Create: `autoRouterSwitchAgent/src/observability/logReader.ts`
- Create: `autoRouterSwitchAgent/tests/observability/logReader.test.ts`

- [ ] **Step 1: Add `getLogsDir`**

Add to [`src/util/paths.ts`](../src/util/paths.ts):

```typescript
import { mkdirSync } from "fs";

export function getArsLogsDir(): string {
  const d = join(getArsHome(), "logs");
  mkdirSync(d, { recursive: true });
  return d;
}
```

- [ ] **Step 2: File logger**

Extend [`src/logging/logger.ts`](../src/logging/logger.ts) to export:

```typescript
import pino from "pino";
import { createWriteStream } from "fs";
import { join } from "path";
import { getArsLogsDir } from "../util/paths.js";

export function createDaemonLogger(level: string, logFileBasename = "ars.log") {
  const dest = join(getArsLogsDir(), logFileBasename);
  const stream = createWriteStream(dest, { flags: "a" });
  return pino({ level }, pino.multistream([{ stream }, { stream: process.stderr }]));
}
```

- [ ] **Step 3: Use in CLI `start`**

In [`src/cli/index.ts`](../src/cli/index.ts), before `loadRuntime`, create logger with `cfg.daemon.log_level` and pass `log` into `setDecideContext` **only if** you extend `DecideContext` with optional `logger` — minimal alternative: call `createDaemonLogger` and assign to a module-level singleton `setArsLogger` in `logger.ts` used by `decideHandler`. Prefer explicit injection:

Add optional `logger` to `DecideContext` in `decideHandler.ts` and use `logger?.info({ decisionId, requestId, sessionId }, "decide")` after audit.

- [ ] **Step 4: `logReader.ts` MVP**

```typescript
import { createReadStream } from "fs";
import { createInterface } from "readline";
import { join } from "path";

export type LogQuery = {
  limit: number;
  requestId?: string;
  level?: string;
};

export async function readRecentLogs(logFile: string, q: LogQuery): Promise<unknown[]> {
  const limit = Math.min(Math.max(q.limit, 1), 500);
  const out: unknown[] = [];
  const stream = createReadStream(logFile, { encoding: "utf8" });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });
  const buf: string[] = [];
  for await (const line of rl) {
    if (!line.trim()) continue;
    buf.push(line);
    if (buf.length > 10_000) buf.splice(0, buf.length - 10_000);
  }
  for (let i = buf.length - 1; i >= 0 && out.length < limit; i--) {
    try {
      const j = JSON.parse(buf[i]) as Record<string, unknown>;
      if (q.requestId && j.requestId !== q.requestId) continue;
      if (q.level && j.level !== q.level) continue;
      out.push(j);
    } catch {
      /* skip */
    }
  }
  return out;
}
```

- [ ] **Step 5: Test logReader with temp file**

Write lines newest-interest last in file, assert filter — **or** simplify test to single-line JSON file.

- [ ] **Step 6: Commit**

```bash
git add autoRouterSwitchAgent/src/util/paths.ts autoRouterSwitchAgent/src/logging/logger.ts autoRouterSwitchAgent/src/cli/index.ts autoRouterSwitchAgent/src/daemon/decideHandler.ts autoRouterSwitchAgent/src/observability/logReader.ts autoRouterSwitchAgent/tests/observability/logReader.test.ts
git commit -m "feat(ars): file JSON logging and logReader for observability API"
```

---

### Task 4: Fastify observability API + static UI

**Files:**
- Create: `autoRouterSwitchAgent/src/daemon/observabilityApi.ts`
- Modify: [`src/daemon/httpServer.ts`](../src/daemon/httpServer.ts)
- Modify: [`package.json`](../package.json) — add `@fastify/static`
- Create: `autoRouterSwitchAgent/public/index.html`
- Modify: [`tests/daemon/httpServer.test.ts`](../tests/daemon/httpServer.test.ts)

- [ ] **Step 1: Add dependency**

Run: `pnpm add @fastify/static --filter auto-router-switch-agent` or from package dir `pnpm add @fastify/static`

- [ ] **Step 2: Extend `StartDaemonOpts`**

```typescript
export type StartDaemonOpts = {
  port: number;
  host: string;
  stateDbPath: string;
  logsDir: string;
};
```

- [ ] **Step 3: Implement `registerObservabilityRoutes`**

`src/daemon/observabilityApi.ts` registers:

- `GET /health` → `{ ok: true }`
- `GET /api/audit` → query params `limit`, `from`, `to`, `sessionId` → open `StateStore(stateDbPath)`, `listAudit`, map rows so `detail_json` parsed and passed through `redactForUi`, close store **or** keep long-lived store if daemon passes store instance (prefer reusing same store as decide — if daemon only has path, open read-only better-sqlite3 in readonly mode for GET only to avoid lock contention; for MVP same process can share `StateStore` reference injected).

**Recommended:** Pass `getStore: () => StateStore` from CLI after `loadRuntime` into `startDaemonServer` so audit reads use the same connection as writes.

- `GET /api/audit/:decisionId` → `getAudit` + parse `detail_json` + redact

- `GET /api/logs` → `readRecentLogs(join(logsDir,'ars.log'), { limit, requestId, level })` then `redactForUi` each

- [ ] **Step 4: Register static**

```typescript
await app.register(import("@fastify/static"), {
  root: pathJoin(fileURLToPath(new URL("../../public", import.meta.url))),
  prefix: "/",
});
```

Use correct relative path from compiled `dist/` — **use `path.join(__dirname, "../public")` pattern** with `import.meta.url` for ESM.

- [ ] **Step 5: CLI passes paths**

Update [`src/cli/index.ts`](../src/cli/index.ts) `startDaemonServer` call:

```typescript
import { getArsLogsDir } from "../util/paths.js";
// ...
const dbPath = join(getArsHome(), "state.db");
await loadRuntime(cfg);
const { close } = await startDaemonServer({
  port: cfg.daemon.http_port,
  host: "127.0.0.1",
  getStore: () => getDecideContext()!.store,
  logsDir: getArsLogsDir(),
});
```

Refactor `startDaemonServer` to accept `getStore` instead of raw path if store is already open.

- [ ] **Step 6: Failing HTTP tests**

Append to `tests/daemon/httpServer.test.ts`:

```typescript
it("GET /api/audit returns list", async () => {
  const app = await startDaemonServer({
    port: 0,
    host: "127.0.0.1",
    getStore: () => {
      throw new Error("unused");
    },
    logsDir: "/tmp",
  });
  // inject mock — adjust to actual API shape
});
```

**Concrete approach:** Use temp dir + real `StateStore` + `setDecideContext` minimal mock, or export `registerObservabilityRoutes` for unit test with fake store. Simplest: integration test creating `StateStore` temp file, seed one row, start server with `getStore` returning that instance.

- [ ] **Step 7: Minimal `public/index.html`**

Single HTML file with `<script type="module">` that `fetch('/api/audit?limit=20')` and renders `<table>`. Link to `/api/audit?id=` detail panel. No bundler (per spec §7).

- [ ] **Step 8: Run full test suite**

Run: `pnpm exec vitest run`

Expected: ALL PASS.

- [ ] **Step 9: Commit**

```bash
git add autoRouterSwitchAgent/package.json autoRouterSwitchAgent/pnpm-lock.yaml autoRouterSwitchAgent/src/daemon/httpServer.ts autoRouterSwitchAgent/src/daemon/observabilityApi.ts autoRouterSwitchAgent/public/index.html autoRouterSwitchAgent/src/cli/index.ts autoRouterSwitchAgent/tests/daemon/httpServer.test.ts
git commit -m "feat(ars): observability REST API and static web UI"
```

---

### Task 5: Documentation cross-reference

**Files:**
- Modify: [`003-log-visualization-spec.md`](./003-log-visualization-spec.md) (optional — add "Implementation:" link to this plan)

- [ ] **Step 1: Add one line at top of 003 or bottom §10**

```markdown
**Implementation plan:** [004-log-visualization-implementation-plan.md](./004-log-visualization-implementation-plan.md)
```

- [ ] **Step 2: Commit**

```bash
git add autoRouterSwitchAgent/spec/003-log-visualization-spec.md
git commit -m "docs(ars): link log visualization spec to implementation plan"
```

---

## Spec coverage checklist

| 003 section | Task |
|-------------|------|
| §2 关联键 | Task 1 (`requestId`/`sessionId` in audit JSON), Task 3 (pino fields) |
| §2.2 脱敏 | Task 2 + Task 4；日志另经 `redactForPublicOutput`（内联密钥模式） |
| §8 API | Task 4 (`/api/audit`, `/api/audit/:id`, `/api/logs`, `/health`) |
| §7 方案 A | Task 4 (daemon + static `public/`) |
| §5 面板 MVP | Task 4 (HTML lists audit + logs; full five-panel polish can be iterative) |
| §9 explain 同源 | `ars explain` 与 API 共用 `formatAuditRowForDisplay` + `getAudit` |

## Placeholder scan

No TBD: all modules named; SQL and signatures concrete.

## Execution handoff

计划已在仓库中落实（含脱敏与 explain 对齐）。如需继续迭代，可在新会话中从「后续可选」拆任务。
