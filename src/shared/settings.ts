import { ALL_RULE_IDS } from "./ruleMetadata";
import type { AuditIssue, IgnoredIssueRecord, WebLensSettings } from "./types";

export const DEFAULT_SETTINGS: WebLensSettings = {
  disabledRuleIds: [],
  ignoredIssues: []
};

export function sanitizeSettings(value: unknown): WebLensSettings {
  if (!value || typeof value !== "object") {
    return { ...DEFAULT_SETTINGS };
  }

  const source = value as Partial<WebLensSettings>;
  const disabledRuleIds = Array.isArray(source.disabledRuleIds)
    ? source.disabledRuleIds.filter((ruleId): ruleId is string => ALL_RULE_IDS.includes(String(ruleId)))
    : [];

  const ignoredIssues = Array.isArray(source.ignoredIssues)
    ? source.ignoredIssues.map(sanitizeIgnoredIssue).filter((record): record is IgnoredIssueRecord => record !== null)
    : [];

  return {
    disabledRuleIds: Array.from(new Set(disabledRuleIds)),
    ignoredIssues: dedupeIgnoredIssues(ignoredIssues)
  };
}

export function getEnabledRuleIds(settings: WebLensSettings): string[] {
  const disabled = new Set(settings.disabledRuleIds);
  return ALL_RULE_IDS.filter((ruleId) => !disabled.has(ruleId));
}

export function setRuleEnabled(settings: WebLensSettings, ruleId: string, enabled: boolean): WebLensSettings {
  if (!ALL_RULE_IDS.includes(ruleId)) {
    return settings;
  }

  const disabled = new Set(settings.disabledRuleIds);
  if (enabled) {
    disabled.delete(ruleId);
  } else {
    disabled.add(ruleId);
  }

  return { ...settings, disabledRuleIds: Array.from(disabled) };
}

export function resetRuleSettings(settings: WebLensSettings): WebLensSettings {
  return { ...settings, disabledRuleIds: [] };
}

export function createIgnoredIssueRecord({
  issue,
  scope,
  target,
  pageTitle,
  createdAt = new Date().toISOString()
}: {
  issue: AuditIssue;
  scope: IgnoredIssueRecord["scope"];
  target: string;
  pageTitle?: string;
  createdAt?: string;
}): IgnoredIssueRecord {
  return {
    id: createIgnoredIssueId(issue.ruleId, issue.selector, scope, target),
    ruleId: issue.ruleId,
    selector: issue.selector,
    scope,
    target,
    pageTitle,
    ruleTitle: issue.title,
    createdAt
  };
}

export function addIgnoredIssue(settings: WebLensSettings, record: IgnoredIssueRecord): WebLensSettings {
  return {
    ...settings,
    ignoredIssues: dedupeIgnoredIssues([...settings.ignoredIssues, record])
  };
}

export function removeIgnoredIssue(settings: WebLensSettings, recordId: string): WebLensSettings {
  return {
    ...settings,
    ignoredIssues: settings.ignoredIssues.filter((record) => record.id !== recordId)
  };
}

export function clearIgnoredIssues(settings: WebLensSettings): WebLensSettings {
  return { ...settings, ignoredIssues: [] };
}

export function findMatchingIgnoredRecord(
  issue: AuditIssue,
  records: IgnoredIssueRecord[],
  pageTarget: string,
  siteTarget: string
): IgnoredIssueRecord | undefined {
  return records.find((record) => isIgnoredIssueMatch(issue, record, pageTarget, siteTarget));
}

export function splitIssuesByIgnoredRecords(
  issues: AuditIssue[],
  records: IgnoredIssueRecord[],
  pageTarget: string,
  siteTarget: string
): { issues: AuditIssue[]; ignoredIssues: AuditIssue[] } {
  const activeIssues: AuditIssue[] = [];
  const ignoredIssues: AuditIssue[] = [];

  for (const issue of issues) {
    if (findMatchingIgnoredRecord(issue, records, pageTarget, siteTarget)) {
      ignoredIssues.push(issue);
    } else {
      activeIssues.push(issue);
    }
  }

  return { issues: activeIssues, ignoredIssues };
}

export function isIgnoredIssueMatch(
  issue: AuditIssue,
  record: IgnoredIssueRecord,
  pageTarget: string,
  siteTarget: string
): boolean {
  if (!isValidIgnoredIssueRecord(record)) {
    return false;
  }

  const targetMatches = record.scope === "page" ? record.target === pageTarget : record.target === siteTarget;
  return targetMatches && record.ruleId === issue.ruleId && record.selector === issue.selector;
}

export function createIgnoredIssueId(
  ruleId: string,
  selector: string,
  scope: IgnoredIssueRecord["scope"],
  target: string
): string {
  return `ignore-${hashString(`${ruleId}|${selector}|${scope}|${target}`)}`;
}

function sanitizeIgnoredIssue(value: unknown): IgnoredIssueRecord | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const source = value as Partial<IgnoredIssueRecord>;
  const ruleId = String(source.ruleId ?? "");
  const selector = String(source.selector ?? "");
  const scope = source.scope;
  const target = String(source.target ?? "");

  if (!ruleId || !selector || (scope !== "page" && scope !== "site") || !target) {
    return null;
  }

  return {
    id: source.id || createIgnoredIssueId(ruleId, selector, scope, target),
    ruleId,
    selector,
    scope,
    target,
    pageTitle: source.pageTitle,
    ruleTitle: source.ruleTitle,
    createdAt: source.createdAt || new Date(0).toISOString()
  };
}

function isValidIgnoredIssueRecord(record: IgnoredIssueRecord): boolean {
  return Boolean(
    record &&
      record.ruleId &&
      record.selector &&
      record.target &&
      (record.scope === "page" || record.scope === "site")
  );
}

function dedupeIgnoredIssues(records: IgnoredIssueRecord[]): IgnoredIssueRecord[] {
  const byKey = new Map<string, IgnoredIssueRecord>();

  for (const record of records) {
    byKey.set(`${record.ruleId}|${record.selector}|${record.scope}|${record.target}`, record);
  }

  return Array.from(byKey.values());
}

function hashString(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
}
