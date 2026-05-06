import type { AuditRow } from "../store/stateStore.js";
import { redactForPublicOutput } from "./redact.js";

/** 与 `GET /api/audit*` 及 `ars explain` 共用，保证 CLI / HTTP 展示一致。 */
export function formatAuditRowForDisplay(row: AuditRow) {
  let detail: unknown = {};
  try {
    detail = JSON.parse(row.detail_json) as unknown;
  } catch {
    detail = { raw: row.detail_json };
  }
  return {
    id: row.id,
    created_epoch_ms: row.created_epoch_ms,
    matched_rule: row.matched_rule,
    gate_outcome: row.gate_outcome,
    detail: redactForPublicOutput(detail),
  };
}
