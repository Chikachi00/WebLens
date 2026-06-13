import { beforeEach, describe, expect, it } from "vitest";
import { runAudit } from "./auditEngine";
import { createIgnoredIssueRecord } from "../shared/settings";

describe("runAudit", () => {
  beforeEach(() => {
    document.documentElement.setAttribute("lang", "zh-CN");
    document.body.innerHTML = "";
    window.history.replaceState(null, "", "https://example.com/products?id=1#top");
  });

  it("does not run disabled rules", () => {
    document.body.innerHTML = '<img src="hero.jpg">';

    const report = runAudit({ enabledRuleIds: ["form-label"], ignoredIssues: [] });

    expect(report.issues).toHaveLength(0);
    expect(report.disabledRuleIds).toContain("image-alt");
  });

  it("excludes ignored results from active summary", () => {
    document.body.innerHTML = '<img id="hero" src="hero.jpg">';
    const firstReport = runAudit({ enabledRuleIds: ["image-alt"], ignoredIssues: [] });
    const record = createIgnoredIssueRecord({
      issue: firstReport.issues[0],
      scope: "page",
      target: "https://example.com/products"
    });

    const ignoredReport = runAudit({ enabledRuleIds: ["image-alt"], ignoredIssues: [record] });

    expect(ignoredReport.issues).toHaveLength(0);
    expect(ignoredReport.ignoredIssues).toHaveLength(1);
    expect(ignoredReport.summary.total).toBe(0);
  });
});
