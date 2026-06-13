import { auditRules } from "../rules";
import { summarizeIssues } from "../shared/auditSummary";
import type { AuditReport, PageInfo } from "../shared/types";

export function runAudit(): AuditReport {
  const issues = auditRules.flatMap((rule) => {
    try {
      return rule.check();
    } catch (error) {
      console.warn(`[WebLens] Rule failed: ${rule.id}`, error);
      return [];
    }
  });

  return {
    page: getPageInfo(),
    issues,
    summary: summarizeIssues(issues),
    scannedAt: new Date().toISOString()
  };
}

export function getPageInfo(): PageInfo {
  return {
    title: document.title || "未命名页面",
    domain: window.location.hostname || "本地页面",
    url: window.location.href
  };
}
