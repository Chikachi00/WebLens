import { SETTINGS_STORAGE_KEY } from "../../shared/constants";
import {
  addIgnoredIssue,
  clearIgnoredIssues,
  removeIgnoredIssue,
  resetRuleSettings,
  sanitizeSettings,
  setRuleEnabled
} from "../../shared/settings";
import type { IgnoredIssueRecord, WebLensSettings } from "../../shared/types";

export async function loadSettings(): Promise<WebLensSettings> {
  try {
    const result = await chrome.storage.local.get(SETTINGS_STORAGE_KEY);
    return sanitizeSettings(result[SETTINGS_STORAGE_KEY]);
  } catch {
    return sanitizeSettings(undefined);
  }
}

export async function saveSettings(settings: WebLensSettings): Promise<WebLensSettings> {
  const sanitized = sanitizeSettings(settings);
  await chrome.storage.local.set({ [SETTINGS_STORAGE_KEY]: sanitized });
  return sanitized;
}

export async function updateRuleEnabled(
  settings: WebLensSettings,
  ruleId: string,
  enabled: boolean
): Promise<WebLensSettings> {
  return saveSettings(setRuleEnabled(settings, ruleId, enabled));
}

export async function restoreDefaultRules(settings: WebLensSettings): Promise<WebLensSettings> {
  return saveSettings(resetRuleSettings(settings));
}

export async function addIgnoredRecord(
  settings: WebLensSettings,
  record: IgnoredIssueRecord
): Promise<WebLensSettings> {
  return saveSettings(addIgnoredIssue(settings, record));
}

export async function removeIgnoredRecord(settings: WebLensSettings, recordId: string): Promise<WebLensSettings> {
  return saveSettings(removeIgnoredIssue(settings, recordId));
}

export async function clearAllIgnoredRecords(settings: WebLensSettings): Promise<WebLensSettings> {
  return saveSettings(clearIgnoredIssues(settings));
}
