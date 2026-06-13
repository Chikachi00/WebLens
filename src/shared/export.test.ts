import { describe, expect, it } from "vitest";
import { createJsonReport, createMarkdownReport, createSafeReportFilename } from "./export";
import type { AuditReport } from "./types";

const report: AuditReport = {
  page: {
    title: "Example | Page [Test]",
    url: "https://example.com/products?id=1",
    domain: "example.com"
  },
  issues: [
    {
      id: "1",
      ruleId: "form-label",
      title: "表单控件缺少标签",
      severity: "critical",
      description: "该输入框缺少可访问名称。",
      recommendation: "使用 label、aria-label 或 aria-labelledby。",
      selector: "input#email",
      elementTag: "input",
      codeSuggestion: '<label for="email">邮箱</label>\n<input id="email" type="email">'
    }
  ],
  ignoredIssues: [],
  summary: { total: 1, critical: 1, warning: 0, info: 0 },
  scannedAt: "2026-06-14T06:30:00.000Z",
  enabledRuleIds: ["form-label"],
  disabledRuleIds: []
};

describe("report export", () => {
  it("creates parseable JSON", () => {
    const parsed = JSON.parse(createJsonReport(report));

    expect(parsed.schemaVersion).toBe("1.0");
    expect(parsed.summary.total).toBe(1);
    expect(parsed.summary.ignored).toBe(0);
  });

  it("creates Markdown with page information and grouped issues", () => {
    const markdown = createMarkdownReport(report, new Date("2026-06-14T06:30:00"));

    expect(markdown).toContain("# WebLens 网页检测报告");
    expect(markdown).toContain("修复预览只在当前浏览器页面中临时生效");
    expect(markdown).toContain("Example \\| Page \\[Test\\]");
    expect(markdown).toContain("## 严重问题");
    expect(markdown).toContain("```html");
  });

  it("exports when there are no issues", () => {
    const markdown = createMarkdownReport({ ...report, issues: [], summary: { total: 0, critical: 0, warning: 0, info: 0 } });

    expect(markdown).toContain("暂无。");
  });

  it("creates safe Windows filenames", () => {
    const filename = createSafeReportFilename('Example:Com<>|"*?', "md", new Date("2026-06-14T06:30:00"));

    expect(filename).toBe("weblens-example-com-2026-06-14-0630.md");
    expect(/[<>:"/\\|?*]/.test(filename)).toBe(false);
  });
});
