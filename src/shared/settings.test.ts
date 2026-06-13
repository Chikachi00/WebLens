import { describe, expect, it } from "vitest";
import {
  addIgnoredIssue,
  clearIgnoredIssues,
  createIgnoredIssueRecord,
  findMatchingIgnoredRecord,
  getEnabledRuleIds,
  removeIgnoredIssue,
  sanitizeSettings,
  setRuleEnabled
} from "./settings";
import type { AuditIssue, IgnoredIssueRecord, WebLensSettings } from "./types";

const issue: AuditIssue = {
  id: "issue-1",
  ruleId: "image-alt",
  title: "图片缺少 alt",
  severity: "warning",
  description: "缺少 alt",
  recommendation: "添加 alt",
  selector: "img.hero",
  elementTag: "img"
};

describe("settings helpers", () => {
  it("returns defaults when stored settings are missing", () => {
    expect(sanitizeSettings(undefined)).toEqual({ disabledRuleIds: [], ignoredIssues: [] });
  });

  it("normalizes missing fields and removes unknown disabled rules", () => {
    expect(sanitizeSettings({ disabledRuleIds: ["image-alt", "missing-rule"] })).toEqual({
      disabledRuleIds: ["image-alt"],
      ignoredIssues: []
    });
  });

  it("filters enabled rule ids from disabled rules", () => {
    const settings = sanitizeSettings({ disabledRuleIds: ["image-alt"] });

    expect(getEnabledRuleIds(settings)).not.toContain("image-alt");
    expect(getEnabledRuleIds(settings)).toContain("form-label");
  });

  it("dedupes repeated ignored records", () => {
    const record = createIgnoredIssueRecord({
      issue,
      scope: "page",
      target: "https://example.com/products",
      createdAt: "2026-06-14T00:00:00.000Z"
    });
    const settings = addIgnoredIssue(addIgnoredIssue({ disabledRuleIds: [], ignoredIssues: [] }, record), record);

    expect(settings.ignoredIssues).toHaveLength(1);
  });

  it("removes one ignored record and clears all ignored records", () => {
    const first = createIgnoredIssueRecord({ issue, scope: "page", target: "https://example.com/a" });
    const second = createIgnoredIssueRecord({ issue, scope: "site", target: "example.com" });
    const settings: WebLensSettings = { disabledRuleIds: [], ignoredIssues: [first, second] };

    expect(removeIgnoredIssue(settings, first.id).ignoredIssues).toEqual([second]);
    expect(clearIgnoredIssues(settings).ignoredIssues).toEqual([]);
  });

  it("matches page and site ignore records and rejects mismatches", () => {
    const pageRecord = createIgnoredIssueRecord({ issue, scope: "page", target: "https://example.com/products" });
    const siteRecord = createIgnoredIssueRecord({ issue, scope: "site", target: "example.com" });
    const differentRule: IgnoredIssueRecord = { ...pageRecord, id: "other", ruleId: "form-label" };
    const differentSelector: IgnoredIssueRecord = { ...pageRecord, id: "other-selector", selector: "img.logo" };

    expect(findMatchingIgnoredRecord(issue, [pageRecord], "https://example.com/products", "example.com")).toBe(pageRecord);
    expect(findMatchingIgnoredRecord(issue, [siteRecord], "https://example.com/other", "example.com")).toBe(siteRecord);
    expect(findMatchingIgnoredRecord(issue, [differentRule], "https://example.com/products", "example.com")).toBeUndefined();
    expect(findMatchingIgnoredRecord(issue, [differentSelector], "https://example.com/products", "example.com")).toBeUndefined();
  });

  it("invalid ignored records do not throw during sanitization", () => {
    expect(sanitizeSettings({ ignoredIssues: [{ ruleId: "image-alt" }, null] }).ignoredIssues).toEqual([]);
  });

  it("can disable and re-enable a rule", () => {
    const disabled = setRuleEnabled({ disabledRuleIds: [], ignoredIssues: [] }, "image-alt", false);
    const enabled = setRuleEnabled(disabled, "image-alt", true);

    expect(disabled.disabledRuleIds).toEqual(["image-alt"]);
    expect(enabled.disabledRuleIds).toEqual([]);
  });
});
