import { getPreviewType } from "./preview";
import { getRuleTitle } from "./ruleMetadata";
import type { AuditIssue, AuditReport } from "./types";

export const WEBLENS_VERSION = "0.3.0";

export interface ExportedAuditReport {
  schemaVersion: "1.0";
  app: {
    name: "WebLens";
    version: string;
  };
  generatedAt: string;
  page: {
    title: string;
    url: string;
    domain: string;
  };
  settings: {
    enabledRuleIds: string[];
    disabledRuleIds: string[];
  };
  summary: {
    total: number;
    critical: number;
    warning: number;
    info: number;
    ignored: number;
  };
  preview: {
    supportedIssueCount: number;
    note: string;
  };
  issues: Array<AuditIssue & { supportsPreview: boolean; previewType?: string }>;
  ignoredIssues: Array<AuditIssue & { supportsPreview: boolean; previewType?: string }>;
}

export function createJsonReport(report: AuditReport): string {
  const exported: ExportedAuditReport = {
    schemaVersion: "1.0",
    app: {
      name: "WebLens",
      version: WEBLENS_VERSION
    },
    generatedAt: new Date().toISOString(),
    page: report.page,
    settings: {
      enabledRuleIds: report.enabledRuleIds,
      disabledRuleIds: report.disabledRuleIds
    },
    summary: {
      ...report.summary,
      ignored: report.ignoredIssues.length
    },
    preview: {
      supportedIssueCount: [...report.issues, ...report.ignoredIssues].filter((issue) => issue.supportsPreview).length,
      note: "Preview changes are temporary and are not included in this report."
    },
    issues: report.issues.map(withPreviewMetadata),
    ignoredIssues: report.ignoredIssues.map(withPreviewMetadata)
  };

  return JSON.stringify(exported, null, 2);
}

export function createMarkdownReport(report: AuditReport, generatedAt = new Date()): string {
  const lines: string[] = [
    "# WebLens 网页检测报告",
    "",
    "> WebLens 的修复预览只在当前浏览器页面中临时生效，不会修改网站源代码。",
    "",
    `- 页面：${escapeMarkdownText(report.page.title || "未命名页面")}`,
    `- 地址：${escapeMarkdownText(report.page.url || "")}`,
    `- 检测时间：${formatDateTime(generatedAt)}`,
    `- WebLens 版本：${WEBLENS_VERSION}`,
    "",
    "## 概览",
    "",
    "| 级别 | 数量 |",
    "|---|---:|",
    `| 严重 | ${report.summary.critical} |`,
    `| 警告 | ${report.summary.warning} |`,
    `| 提示 | ${report.summary.info} |`,
    `| 已忽略 | ${report.ignoredIssues.length} |`,
    `| 支持预览 | ${[...report.issues, ...report.ignoredIssues].filter((issue) => issue.supportsPreview).length} |`,
    ""
  ];

  appendIssueSection(lines, "严重问题", report.issues.filter((issue) => issue.severity === "critical"));
  appendIssueSection(lines, "警告问题", report.issues.filter((issue) => issue.severity === "warning"));
  appendIssueSection(lines, "提示问题", report.issues.filter((issue) => issue.severity === "info"));
  appendIssueSection(lines, "已忽略的问题", report.ignoredIssues);

  return `${lines.join("\n")}\n`;
}

export function createSafeReportFilename(domain: string, extension: "md" | "json", date = new Date()): string {
  const safeDomain = removeControlCharacters(domain || "page")
    .toLowerCase()
    .replace(/[<>:"/\\|?*]/g, "-")
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `weblens-${safeDomain || "page"}-${formatFilenameDate(date)}.${extension}`;
}

function withPreviewMetadata(issue: AuditIssue): AuditIssue & { supportsPreview: boolean; previewType?: string } {
  return {
    ...issue,
    supportsPreview: Boolean(issue.supportsPreview),
    previewType: getPreviewType(issue.previewFix)
  };
}

function appendIssueSection(lines: string[], title: string, issues: AuditIssue[]): void {
  lines.push(`## ${title}`, "");

  if (issues.length === 0) {
    lines.push("暂无。", "");
    return;
  }

  for (const issue of issues) {
    lines.push(`### ${escapeMarkdownText(getRuleTitle(issue.ruleId))}`, "");
    lines.push(`- 元素：\`${escapeCodeSpan(issue.selector)}\``);
    lines.push(`- 说明：${escapeMarkdownText(issue.description)}`);
    lines.push(`- 建议：${escapeMarkdownText(issue.recommendation)}`);
    lines.push(`- 支持预览：${issue.supportsPreview ? "是" : "否"}`);
    if (issue.codeSuggestion) {
      lines.push("- 修复示例：", "", "```html", issue.codeSuggestion, "```");
    }
    lines.push("");
  }
}

function escapeMarkdownText(value: string): string {
  return value.replace(/([\\`*_{}[\]()#+.!|-])/g, "\\$1");
}

function removeControlCharacters(value: string): string {
  return Array.from(value)
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join("");
}

function escapeCodeSpan(value: string): string {
  return value.replace(/`/g, "\\`");
}

function formatDateTime(date: Date): string {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function formatFilenameDate(date: Date): string {
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  return `${year}-${month}-${day}-${hour}${minute}`;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}
