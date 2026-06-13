import { describe, expect, it } from "vitest";
import { summarizeIssues } from "./auditSummary";
import type { AuditIssue } from "./types";

const baseIssue: AuditIssue = {
  id: "issue",
  ruleId: "rule",
  title: "Issue",
  severity: "info",
  description: "Description",
  recommendation: "Recommendation",
  selector: "div",
  elementTag: "div"
};

describe("summarizeIssues", () => {
  it("counts severities and total issues", () => {
    expect(
      summarizeIssues([
        { ...baseIssue, id: "1", severity: "critical" },
        { ...baseIssue, id: "2", severity: "warning" },
        { ...baseIssue, id: "3", severity: "warning" },
        { ...baseIssue, id: "4", severity: "info" }
      ])
    ).toEqual({ total: 4, critical: 1, warning: 2, info: 1 });
  });
});
