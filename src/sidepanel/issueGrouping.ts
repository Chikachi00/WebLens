import type { AuditIssue, AuditSeverity } from "../shared/types";

export interface IssueGroupModel {
  ruleId: string;
  title: string;
  description: string;
  severity: AuditSeverity;
  issues: AuditIssue[];
}

const severityRank: Record<AuditSeverity, number> = {
  critical: 3,
  warning: 2,
  info: 1
};

export function groupIssuesByRule(issues: AuditIssue[]): IssueGroupModel[] {
  const groups = new Map<string, AuditIssue[]>();

  for (const issue of issues) {
    groups.set(issue.ruleId, [...(groups.get(issue.ruleId) ?? []), issue]);
  }

  return Array.from(groups.entries())
    .map(([ruleId, groupIssues]) => ({
      ruleId,
      title: groupIssues[0]?.title ?? ruleId,
      description: groupIssues[0]?.description ?? "",
      severity: getHighestSeverity(groupIssues),
      issues: groupIssues
    }))
    .sort((a, b) => severityRank[b.severity] - severityRank[a.severity] || b.issues.length - a.issues.length);
}

function getHighestSeverity(issues: AuditIssue[]): AuditSeverity {
  return issues.reduce<AuditSeverity>((highest, issue) => {
    return severityRank[issue.severity] > severityRank[highest] ? issue.severity : highest;
  }, "info");
}
