export type AuditSeverity = "critical" | "warning" | "info";

export type AuditCategory = "accessibility" | "semantics" | "layout" | "usability";

export interface AuditRule {
  id: string;
  title: string;
  category: AuditCategory;
  severity: AuditSeverity;
  description: string;
  check: () => AuditIssue[];
}

export interface AuditIssue {
  id: string;
  ruleId: string;
  title: string;
  severity: AuditSeverity;
  description: string;
  recommendation: string;
  selector: string;
  elementTag: string;
  codeSuggestion?: string;
}

export interface IgnoredIssueRecord {
  id: string;
  ruleId: string;
  selector: string;
  scope: "page" | "site";
  target: string;
  pageTitle?: string;
  ruleTitle?: string;
  createdAt: string;
}

export interface WebLensSettings {
  disabledRuleIds: string[];
  ignoredIssues: IgnoredIssueRecord[];
}

export interface AuditSummary {
  total: number;
  critical: number;
  warning: number;
  info: number;
}

export interface PageInfo {
  title: string;
  domain: string;
  url: string;
}

export interface AuditReport {
  page: PageInfo;
  issues: AuditIssue[];
  ignoredIssues: AuditIssue[];
  summary: AuditSummary;
  scannedAt: string;
  enabledRuleIds: string[];
  disabledRuleIds: string[];
}

export interface RunAuditPayload {
  enabledRuleIds: string[];
  ignoredIssues: IgnoredIssueRecord[];
}

export type ExtensionMessage =
  | { type: "RUN_AUDIT"; payload?: RunAuditPayload }
  | { type: "AUDIT_RESULT"; payload: AuditReport }
  | { type: "HIGHLIGHT_ELEMENT"; selector: string }
  | { type: "CLEAR_HIGHLIGHT" }
  | { type: "GET_PAGE_INFO" };

export type ExtensionResponse =
  | { ok: true; payload?: AuditReport | PageInfo | { highlighted: true } }
  | { ok: false; error: string };
