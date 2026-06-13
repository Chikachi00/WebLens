import type { AuditIssue, AuditSeverity, AuditSummary } from "./types";

export function summarizeIssues(issues: AuditIssue[]): AuditSummary {
  return issues.reduce<AuditSummary>(
    (summary, issue) => {
      summary.total += 1;
      summary[issue.severity] += 1;
      return summary;
    },
    { total: 0, critical: 0, warning: 0, info: 0 }
  );
}

export const severityLabel: Record<AuditSeverity, string> = {
  critical: "严重",
  warning: "警告",
  info: "提示"
};
