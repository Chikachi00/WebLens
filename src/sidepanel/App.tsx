import { useCallback, useEffect, useMemo, useState } from "react";
import { ExportMenu } from "./components/ExportMenu";
import { FilterTabs, type IssueFilter } from "./components/FilterTabs";
import { IssueGroup } from "./components/IssueGroup";
import { PreviewStatusBar } from "./components/PreviewStatusBar";
import { SettingsPanel } from "./components/SettingsPanel";
import { SummaryGrid } from "./components/SummaryGrid";
import { Toast, type ToastState, type ToastType } from "./components/Toast";
import { getActiveTab, requestAuditReport, requestElementHighlight, requestPageInfo, revertAllFixPreviewsInTab, type ActiveTabInfo } from "./chromeApi";
import { useFixPreview } from "./hooks/useFixPreview";
import { groupIssuesByRule } from "./issueGrouping";
import {
  addIgnoredRecord,
  clearAllIgnoredRecords,
  loadSettings,
  removeIgnoredRecord,
  restoreDefaultRules,
  updateRuleEnabled
} from "./services/settingsService";
import { summarizeIssues } from "../shared/auditSummary";
import { createJsonReport, createMarkdownReport, createSafeReportFilename } from "../shared/export";
import { ALL_RULE_IDS } from "../shared/ruleMetadata";
import { createIgnoredIssueRecord, findMatchingIgnoredRecord, getEnabledRuleIds, splitIssuesByIgnoredRecords } from "../shared/settings";
import type { AuditIssue, AuditReport, IgnoredIssueRecord, PageInfo, WebLensSettings } from "../shared/types";
import { getSiteTarget, normalizePageUrl } from "../shared/url";

const emptySummary = { total: 0, critical: 0, warning: 0, info: 0 };
const defaultSettings: WebLensSettings = { disabledRuleIds: [], ignoredIssues: [] };

export default function App() {
  const [settings, setSettings] = useState<WebLensSettings>(defaultSettings);
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTabInfo | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [filter, setFilter] = useState<IssueFilter>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showIgnored, setShowIgnored] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((type: ToastType, message: string) => setToast({ type, message }), []);
  const dismissToast = useCallback(() => setToast(null), []);
  const enabledRuleIds = useMemo(() => getEnabledRuleIds(settings), [settings]);

  const {
    activePreviews,
    pendingIssueId,
    applyPreview,
    revertPreview,
    revertAllPreviews,
    clearPreviewState,
    isPreviewActive
  } = useFixPreview(
    (message) => showToast("error", message),
    (message) => showToast("success", message)
  );

  useEffect(() => {
    loadSettings()
      .then(setSettings)
      .catch(() => {
        setSettings(defaultSettings);
        showToast("error", "读取设置失败，已使用默认设置。");
      });
  }, [showToast]);

  const refreshPageInfo = useCallback(
    async (clearCurrentReport: boolean) => {
      try {
        const tab = await getActiveTab();
        setActiveTab(tab);
        if (clearCurrentReport) {
          await revertAllPreviews();
          clearPreviewState();
          setReport(null);
          setFilter("all");
          showToast("info", "当前标签页或页面状态已变化，请重新分析页面。");
        }

        try {
          setPageInfo(await requestPageInfo());
        } catch {
          setPageInfo({ title: tab.title || "无法读取当前页面", domain: tab.domain, url: tab.url });
        }
      } catch {
        clearPreviewState();
        setPageInfo({ title: "无法读取当前页面", domain: "受限制页面", url: "" });
      }
    },
    [clearPreviewState, revertAllPreviews, showToast]
  );

  useEffect(() => {
    refreshPageInfo(false);

    const handleTabActivated = () => {
      if (activeTab?.id) {
        revertAllFixPreviewsInTab(activeTab.id).catch(() => {
          // The old tab may be restricted or already gone; local state is cleared by refreshPageInfo.
        });
      }
      refreshPageInfo(true);
    };
    const handleTabUpdated = (tabId: number, changeInfo: chrome.tabs.TabChangeInfo, tab: chrome.tabs.Tab) => {
      const urlChanged = Boolean(changeInfo.url && activeTab?.url && changeInfo.url !== activeTab.url);
      const completedCurrentTab = activeTab?.id === tabId && changeInfo.status === "complete";
      const spaLikeUrlChange = activeTab?.id === tabId && Boolean(tab.url && activeTab.url && tab.url !== activeTab.url);
      if (completedCurrentTab || urlChanged || spaLikeUrlChange) {
        refreshPageInfo(true);
      }
    };

    chrome.tabs.onActivated.addListener(handleTabActivated);
    chrome.tabs.onUpdated.addListener(handleTabUpdated);
    return () => {
      chrome.tabs.onActivated.removeListener(handleTabActivated);
      chrome.tabs.onUpdated.removeListener(handleTabUpdated);
    };
  }, [activeTab?.id, activeTab?.url, refreshPageInfo]);

  const visibleIssues = useMemo(() => {
    const issues = report?.issues ?? [];
    return filter === "all" ? issues : issues.filter((issue) => issue.severity === filter);
  }, [filter, report]);

  const visibleGroups = useMemo(() => groupIssuesByRule(visibleIssues), [visibleIssues]);

  async function runAudit() {
    setIsLoading(true);
    dismissToast();

    if (enabledRuleIds.length === 0) {
      setIsLoading(false);
      showToast("info", "当前没有启用任何检测规则，请先在设置中启用规则。");
      return;
    }

    if (activePreviews.length > 0) {
      const confirmed = window.confirm("重新分析会先撤销当前全部预览。是否继续？");
      if (!confirmed) {
        setIsLoading(false);
        return;
      }
      await revertAllPreviews();
      clearPreviewState();
    }

    try {
      const nextReport = await requestAuditReport({ enabledRuleIds, ignoredIssues: settings.ignoredIssues });
      setReport(nextReport);
      setPageInfo(nextReport.page);
      setFilter("all");
      setShowIgnored(nextReport.ignoredIssues.length > 0);
    } catch (error) {
      showToast("error", getFriendlyError(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function locateIssue(issue: AuditIssue) {
    dismissToast();
    if (report && activeTab?.url && normalizePageUrl(report.page.url) !== normalizePageUrl(activeTab.url)) {
      showToast("error", "当前标签页已经变化，请重新分析后再定位元素。");
      return;
    }

    try {
      await requestElementHighlight(issue.selector);
    } catch (error) {
      showToast("error", `${getFriendlyError(error)} 建议重新分析当前页面。`);
    }
  }

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);
    showToast("success", "修复代码已复制。");
  }

  async function ignoreIssue(issue: AuditIssue, scope: IgnoredIssueRecord["scope"]) {
    if (!report) return;

    const target = scope === "page" ? normalizePageUrl(report.page.url) : getSiteTarget(report.page.url);
    if (!target) {
      showToast("error", "当前页面地址无法用于忽略记录。");
      return;
    }

    const nextSettings = await addIgnoredRecord(
      settings,
      createIgnoredIssueRecord({ issue, scope, target, pageTitle: report.page.title })
    );
    setSettings(nextSettings);
    setReport(reapplyIgnoredRecords(report, nextSettings));
    showToast("success", scope === "page" ? "已在当前页面忽略该问题。" : "已在当前网站忽略该问题。");
  }

  async function restoreIgnoredIssue(issue: AuditIssue) {
    if (!report) return;

    const record = findMatchingIgnoredRecord(
      issue,
      settings.ignoredIssues,
      normalizePageUrl(report.page.url),
      getSiteTarget(report.page.url)
    );
    if (!record) {
      showToast("info", "未找到对应的忽略记录。");
      return;
    }

    const nextSettings = await removeIgnoredRecord(settings, record.id);
    setSettings(nextSettings);
    setReport(reapplyIgnoredRecords(report, nextSettings));
    showToast("success", "已恢复该问题。");
  }

  async function toggleRule(ruleId: string, enabled: boolean) {
    try {
      const nextSettings = await updateRuleEnabled(settings, ruleId, enabled);
      setSettings(nextSettings);
      setReport(null);
      clearPreviewState();
      showToast("success", "规则设置已保存，请重新分析当前页面。");
    } catch {
      showToast("error", "保存规则设置失败。");
    }
  }

  async function restoreRules() {
    const nextSettings = await restoreDefaultRules(settings);
    setSettings(nextSettings);
    setReport(null);
    clearPreviewState();
    showToast("success", "已恢复默认规则，请重新分析当前页面。");
  }

  async function removeIgnored(recordId: string) {
    const nextSettings = await removeIgnoredRecord(settings, recordId);
    setSettings(nextSettings);
    if (report) setReport(reapplyIgnoredRecords(report, nextSettings));
    showToast("success", "忽略记录已删除。");
  }

  async function clearIgnored() {
    if (!window.confirm("确定要清除全部忽略记录吗？规则开关不会被修改。")) return;

    const nextSettings = await clearAllIgnoredRecords(settings);
    setSettings(nextSettings);
    if (report) setReport(reapplyIgnoredRecords(report, nextSettings));
    showToast("success", "已清除全部忽略记录。");
  }

  function exportReport(format: "md" | "json") {
    if (!report) return;

    const content = format === "md" ? createMarkdownReport(report) : createJsonReport(report);
    const type = format === "md" ? "text/markdown;charset=utf-8" : "application/json;charset=utf-8";
    downloadTextFile(content, type, createSafeReportFilename(report.page.domain, format));
    showToast("success", format === "md" ? "Markdown 报告已导出。" : "JSON 报告已导出。");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 p-4">
      <header className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-900 text-sm font-bold text-white dark:bg-slate-100 dark:text-slate-950">
              WL
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-semibold text-slate-950 dark:text-slate-50">WebLens</h1>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">本地 UI 与可访问性检测</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="打开设置"
            onClick={() => setSettingsOpen(true)}
            className="min-h-10 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            设置
          </button>
        </div>

        <section className="rounded-md border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
          <p className="truncate text-sm font-medium text-slate-950 dark:text-slate-50">
            {pageInfo?.title ?? "正在读取页面信息"}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{pageInfo?.domain ?? "..."}</p>
          <button
            type="button"
            onClick={runAudit}
            disabled={isLoading}
            className="mt-3 min-h-11 w-full rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading ? "正在分析" : "分析当前页面"}
          </button>
        </section>
      </header>

      <Toast toast={toast} onDismiss={dismissToast} />
      <PreviewStatusBar count={activePreviews.length} onRevertAll={revertAllPreviews} />
      <SummaryGrid summary={report?.summary ?? emptySummary} />

      {report ? (
        <section className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900">
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
            <div>启用规则 {report.enabledRuleIds.length}/{ALL_RULE_IDS.length}</div>
            {report.ignoredIssues.length > 0 ? <div>已忽略 {report.ignoredIssues.length} 项</div> : <div>无忽略项</div>}
          </div>
          <ExportMenu disabled={!report} onExportMarkdown={() => exportReport("md")} onExportJson={() => exportReport("json")} />
          {report.ignoredIssues.length > 0 ? (
            <button
              type="button"
              onClick={() => setShowIgnored((current) => !current)}
              className="min-h-8 text-sm font-medium text-blue-700 hover:underline dark:text-blue-300"
            >
              {showIgnored ? "收起本次忽略项" : "查看本次忽略项"}
            </button>
          ) : null}
        </section>
      ) : null}

      {showIgnored && report?.ignoredIssues.length ? (
        <section className="space-y-2 rounded-md border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-sm font-semibold text-slate-950 dark:text-slate-50">本次检测中被忽略的问题</h2>
          {report.ignoredIssues.map((issue) => {
            const record = findMatchingIgnoredRecord(
              issue,
              settings.ignoredIssues,
              normalizePageUrl(report.page.url),
              getSiteTarget(report.page.url)
            );
            return (
              <div key={issue.id} className="rounded border border-slate-200 p-2 text-sm dark:border-slate-700">
                <div className="font-medium text-slate-900 dark:text-slate-100">{issue.title}</div>
                <div className="mt-1 break-all font-mono text-xs text-slate-500 dark:text-slate-400">{issue.selector}</div>
                {record ? (
                  <div className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    {record.scope === "page" ? "当前页面" : "当前网站"}：{record.target}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => restoreIgnoredIssue(issue)}
                  className="mt-2 min-h-8 rounded-md border border-slate-300 px-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  恢复
                </button>
              </div>
            );
          })}
        </section>
      ) : null}

      <FilterTabs value={filter} onChange={setFilter} />

      <section className="flex flex-col gap-3 pb-4">
        {report && visibleIssues.length === 0 ? (
          <div className="rounded-md border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {report.summary.total === 0 && report.ignoredIssues.length > 0 ? (
              <p>发现的问题均已被忽略。</p>
            ) : (
              <p>{filter === "all" ? "当前启用规则未发现问题。" : "当前筛选条件下没有问题。"}</p>
            )}
            <p>自动检测不能代替完整的人工测试。</p>
          </div>
        ) : null}

        {!report ? (
          <div className="rounded-md border border-dashed border-slate-300 p-4 text-sm leading-6 text-slate-500 dark:border-slate-700 dark:text-slate-400">
            点击“分析当前页面”开始本地检测。
          </div>
        ) : null}

        {visibleGroups.map((group) => (
          <IssueGroup
            key={group.ruleId}
            group={group}
            onLocate={locateIssue}
            onCopy={copyCode}
            onIgnore={ignoreIssue}
            onApplyPreview={applyPreview}
            onRevertPreview={revertPreview}
            isPreviewActive={isPreviewActive}
            pendingIssueId={pendingIssueId}
          />
        ))}
      </section>

      <SettingsPanel
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onToggleRule={toggleRule}
        onRestoreRules={restoreRules}
        onRemoveIgnored={removeIgnored}
        onClearIgnored={clearIgnored}
      />
    </main>
  );
}

function reapplyIgnoredRecords(report: AuditReport, settings: WebLensSettings): AuditReport {
  const split = splitIssuesByIgnoredRecords(
    [...report.issues, ...report.ignoredIssues],
    settings.ignoredIssues,
    normalizePageUrl(report.page.url),
    getSiteTarget(report.page.url)
  );

  return {
    ...report,
    issues: split.issues,
    ignoredIssues: split.ignoredIssues,
    summary: summarizeIssues(split.issues)
  };
}

function downloadTextFile(content: string, type: string, filename: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function getFriendlyError(error: unknown): string {
  if (error instanceof Error && error.message) {
    if (error.message.includes("Receiving end does not exist")) {
      return "当前页面无法接收扩展消息。请刷新页面后重试，或避开 Chrome 内置页面。";
    }

    return error.message;
  }

  return "操作失败，请刷新页面后重试。";
}
