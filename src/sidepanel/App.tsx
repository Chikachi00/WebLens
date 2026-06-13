import { useEffect, useMemo, useState } from "react";
import { FilterTabs, type IssueFilter } from "./components/FilterTabs";
import { IssueCard } from "./components/IssueCard";
import { SummaryGrid } from "./components/SummaryGrid";
import { requestAuditReport, requestElementHighlight, requestPageInfo } from "./chromeApi";
import type { AuditIssue, AuditReport, PageInfo } from "../shared/types";

const emptySummary = { total: 0, critical: 0, warning: 0, info: 0 };

export default function App() {
  const [pageInfo, setPageInfo] = useState<PageInfo | null>(null);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [filter, setFilter] = useState<IssueFilter>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    requestPageInfo()
      .then(setPageInfo)
      .catch(() => {
        setPageInfo({ title: "无法读取当前页面", domain: "受限制页面", url: "" });
      });
  }, []);

  const visibleIssues = useMemo(() => {
    const issues = report?.issues ?? [];
    return filter === "all" ? issues : issues.filter((issue) => issue.severity === filter);
  }, [filter, report]);

  async function runAudit() {
    setIsLoading(true);
    setMessage(null);

    try {
      const nextReport = await requestAuditReport();
      setReport(nextReport);
      setPageInfo(nextReport.page);
      setFilter("all");
    } catch (error) {
      setMessage(getFriendlyError(error));
    } finally {
      setIsLoading(false);
    }
  }

  async function locateIssue(issue: AuditIssue) {
    setMessage(null);

    try {
      await requestElementHighlight(issue.selector);
    } catch (error) {
      setMessage(getFriendlyError(error));
    }
  }

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);
    setMessage("修复代码已复制。");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 p-4">
      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-slate-900 text-sm font-bold text-white dark:bg-slate-100 dark:text-slate-950">
            WL
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-semibold text-slate-950 dark:text-slate-50">WebLens</h1>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">本地 UI 与可访问性检测</p>
          </div>
        </div>

        <section className="rounded-md border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-950 dark:text-slate-50">
              {pageInfo?.title ?? "正在读取页面信息"}
            </p>
            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{pageInfo?.domain ?? "..."}</p>
          </div>
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

      {message ? (
        <div className="rounded-md border border-slate-200 bg-slate-100 p-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          {message}
        </div>
      ) : null}

      <SummaryGrid summary={report?.summary ?? emptySummary} />
      <FilterTabs value={filter} onChange={setFilter} />

      <section className="flex flex-col gap-3 pb-4">
        {report && visibleIssues.length === 0 ? (
          <div className="rounded-md border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <p>暂未发现当前版本能够识别的问题。</p>
            <p>自动检测不能代替完整的人工测试。</p>
          </div>
        ) : null}

        {!report ? (
          <div className="rounded-md border border-dashed border-slate-300 p-4 text-sm leading-6 text-slate-500 dark:border-slate-700 dark:text-slate-400">
            点击“分析当前页面”开始本地检测。
          </div>
        ) : null}

        {visibleIssues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} onLocate={locateIssue} onCopy={copyCode} />
        ))}
      </section>
    </main>
  );
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
