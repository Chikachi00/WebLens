import { describe, expect, it } from "vitest";
import { groupIssuesByRule } from "./issueGrouping";
import type { AuditIssue } from "../shared/types";

describe("groupIssuesByRule", () => {
  it("groups issues by ruleId", () => {
    const groups = groupIssuesByRule([
      issue("a", "touch-target", "info"),
      issue("b", "touch-target", "warning"),
      issue("c", "button-name", "critical")
    ]);

    expect(groups).toHaveLength(2);
    expect(groups.find((group) => group.ruleId === "touch-target")?.issues).toHaveLength(2);
  });

  it("uses the highest severity in each group and sorts severe groups first", () => {
    const groups = groupIssuesByRule([
      issue("a", "touch-target", "info"),
      issue("b", "touch-target", "warning"),
      issue("c", "document-language", "info")
    ]);

    expect(groups[0].ruleId).toBe("touch-target");
    expect(groups[0].severity).toBe("warning");
  });

  it("updates group counts after ignored issues are removed from the visible list", () => {
    const visible = [issue("a", "touch-target", "warning")];
    const groups = groupIssuesByRule(visible);

    expect(groups).toHaveLength(1);
    expect(groups[0].issues).toHaveLength(1);
  });

  it("handles a single issue group", () => {
    const groups = groupIssuesByRule([issue("a", "link-name", "warning")]);

    expect(groups).toEqual([
      expect.objectContaining({
        ruleId: "link-name",
        severity: "warning",
        issues: [expect.objectContaining({ id: "a" })]
      })
    ]);
  });
});

function issue(id: string, ruleId: string, severity: AuditIssue["severity"]): AuditIssue {
  return {
    id,
    ruleId,
    title: `${ruleId} title`,
    severity,
    description: `${ruleId} description`,
    recommendation: "Fix it",
    selector: `#${id}`,
    elementTag: "button"
  };
}
