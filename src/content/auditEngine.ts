import { auditRules } from "../rules";
import type { AuditIssue, AuditReport, AuditSummary, IgnoredIssueRecord, PageInfo, RunAuditPayload } from "../shared/types";

export function runAudit(payload?: RunAuditPayload): AuditReport {
  const allRuleIds = auditRules.map((rule) => rule.id);
  const enabledRuleIds = payload?.enabledRuleIds?.length ? payload.enabledRuleIds : ALL_RULE_IDS;
  const enabledRuleSet = new Set(enabledRuleIds);
  const disabledRuleIds = allRuleIds.filter((ruleId) => !enabledRuleSet.has(ruleId));
  const page = getPageInfo();
  const pageTarget = normalizePageUrl(page.url);
  const siteTarget = getSiteTarget(page.url);

  const rawIssues = auditRules.filter((rule) => enabledRuleSet.has(rule.id)).flatMap((rule) => {
    try {
      return rule.check();
    } catch (error) {
      console.warn(`[WebLens] Rule failed: ${rule.id}`, error);
      return [];
    }
  });
  const ignoredIssues: AuditIssue[] = [];
  const issues: AuditIssue[] = [];

  for (const issue of rawIssues) {
    const ignoredRecord = findMatchingIgnoredRecord(issue, payload?.ignoredIssues ?? [], pageTarget, siteTarget);
    if (ignoredRecord) {
      ignoredIssues.push(issue);
    } else {
      issues.push(issue);
    }
  }

  return {
    page,
    issues,
    ignoredIssues,
    summary: summarizeIssues(issues),
    scannedAt: new Date().toISOString(),
    enabledRuleIds,
    disabledRuleIds
  };
}

const ALL_RULE_IDS = auditRules.map((rule) => rule.id);

function summarizeIssues(issues: AuditIssue[]): AuditSummary {
  return issues.reduce<AuditSummary>(
    (summary, issue) => {
      summary.total += 1;
      summary[issue.severity] += 1;
      return summary;
    },
    { total: 0, critical: 0, warning: 0, info: 0 }
  );
}

function findMatchingIgnoredRecord(
  issue: AuditIssue,
  records: IgnoredIssueRecord[],
  pageTarget: string,
  siteTarget: string
): IgnoredIssueRecord | undefined {
  return records.find((record) => {
    if (!record || !record.ruleId || !record.selector || !record.target) {
      return false;
    }

    const targetMatches = record.scope === "page" ? record.target === pageTarget : record.scope === "site" && record.target === siteTarget;
    return targetMatches && record.ruleId === issue.ruleId && record.selector === issue.selector;
  });
}

function normalizePageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.search = "";
    if (parsed.pathname !== "/") {
      parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    }
    return parsed.toString().replace(/\/$/, parsed.pathname === "/" ? "/" : "");
  } catch {
    return "";
  }
}

function getSiteTarget(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

export function getPageInfo(): PageInfo {
  return {
    title: document.title || "未命名页面",
    domain: window.location.hostname || "本地页面",
    url: window.location.href
  };
}
