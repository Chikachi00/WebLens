export type AuditSeverity = "critical" | "warning" | "info";

export type AuditCategory = "accessibility" | "semantics" | "layout" | "usability";

export type AuditConfidence = "high" | "medium" | "low";

export interface AuditDiagnostics {
  confidence: AuditConfidence;
  standard?: string;
  measured?: Record<string, string | number | boolean>;
  reasonCode?: string;
  note?: string;
}

export interface AuditRule {
  id: string;
  title: string;
  category: AuditCategory;
  severity: AuditSeverity;
  description: string;
  supportsPreview: boolean;
  check: () => AuditIssue[];
}

export type PreviewFix = StylePreviewFix | AttributePreviewFix | CompositePreviewFix;

export interface StylePreviewFix {
  type: "style";
  styles: Record<string, string>;
}

export interface AttributePreviewFix {
  type: "attribute";
  attribute: string;
  value: string;
}

export interface CompositePreviewFix {
  type: "composite";
  operations: PreviewOperation[];
}

export type PreviewOperation =
  | {
      type: "style";
      styles: Record<string, string>;
    }
  | {
      type: "attribute";
      attribute: string;
      value: string;
    };

export interface PreviewFixOption {
  label: string;
  fix: PreviewFix;
  note?: string;
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
  supportsPreview?: boolean;
  previewFix?: PreviewFix;
  previewFixOptions?: PreviewFixOption[];
  previewBefore?: string[];
  previewAfter?: string[];
  previewNote?: string;
  diagnostics?: AuditDiagnostics;
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

export interface PreviewActionResult {
  success: boolean;
  issueId?: string;
  message?: string;
  activePreviewCount: number;
}

export interface ActivePreview {
  issueId: string;
  ruleId: string;
  selector: string;
  appliedAt: string;
  fix: PreviewFix;
}

export interface RunAuditPayload {
  enabledRuleIds: string[];
  ignoredIssues: IgnoredIssueRecord[];
}

export type ExtensionMessage =
  | { type: "RUN_AUDIT"; payload?: RunAuditPayload }
  | { type: "AUDIT_RESULT"; payload: AuditReport }
  | { type: "HIGHLIGHT_ELEMENT"; selector: string }
  | {
      type: "APPLY_FIX_PREVIEW";
      payload: {
        issueId: string;
        ruleId: string;
        selector: string;
        fix: PreviewFix;
      };
    }
  | {
      type: "REVERT_FIX_PREVIEW";
      payload: {
        issueId: string;
      };
    }
  | { type: "REVERT_ALL_FIX_PREVIEWS" }
  | { type: "GET_ACTIVE_FIX_PREVIEWS" }
  | { type: "CLEAR_HIGHLIGHT" }
  | { type: "GET_PAGE_INFO" };

export type ExtensionResponse =
  | { ok: true; payload?: AuditReport | PageInfo | PreviewActionResult | ActivePreview[] | { highlighted: true } }
  | { ok: false; error: string };
