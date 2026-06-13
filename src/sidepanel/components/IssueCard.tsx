import { useState } from "react";
import { IssueDiagnostics } from "./IssueDiagnostics";
import { SeverityBadge } from "./Badge";
import { PreviewComparison } from "./PreviewComparison";
import type { AuditIssue, IgnoredIssueRecord, PreviewFix } from "../../shared/types";

export function IssueCard({
  issue,
  onLocate,
  onCopy,
  onIgnore,
  onApplyPreview,
  onRevertPreview,
  isPreviewActive,
  isPreviewPending
}: {
  issue: AuditIssue;
  onLocate: (issue: AuditIssue) => void;
  onCopy: (code: string) => void;
  onIgnore: (issue: AuditIssue, scope: IgnoredIssueRecord["scope"]) => void;
  onApplyPreview: (issue: AuditIssue, fix: PreviewFix) => void;
  onRevertPreview: (issueId: string) => void;
  isPreviewActive: boolean;
  isPreviewPending: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [ignoreOpen, setIgnoreOpen] = useState(false);

  return (
    <article className="rounded-md border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start gap-2">
        <SeverityBadge severity={issue.severity} />
        {isPreviewActive ? (
          <span className="inline-flex shrink-0 items-center rounded border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
            正在预览
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold leading-5 text-slate-950 dark:text-slate-50">{issue.title}</h3>
          <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">{issue.description}</p>
        </div>
      </div>

      <div className="mt-3 rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-300">
        <span className="font-semibold">{issue.elementTag}</span>
        <span className="ml-2 break-all">{issue.selector}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onLocate(issue)}
          className="min-h-9 rounded-md bg-slate-900 px-3 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
        >
          定位元素
        </button>
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="min-h-9 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          {expanded ? "收起建议" : "查看建议"}
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIgnoreOpen((current) => !current)}
            className="min-h-9 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            忽略
          </button>
          {ignoreOpen ? (
            <div className="absolute right-0 z-10 mt-1 w-40 rounded-md border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => {
                  onIgnore(issue, "page");
                  setIgnoreOpen(false);
                }}
                className="block min-h-8 w-full rounded px-2 text-left text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                仅在当前页面忽略
              </button>
              <button
                type="button"
                onClick={() => {
                  onIgnore(issue, "site");
                  setIgnoreOpen(false);
                }}
                className="block min-h-8 w-full rounded px-2 text-left text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                在当前网站忽略
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {expanded ? (
        <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700">
          <p className="text-sm leading-5 text-slate-700 dark:text-slate-200">{issue.recommendation}</p>
          <IssueDiagnostics diagnostics={issue.diagnostics} />
          <PreviewComparison issue={issue} />

          {issue.supportsPreview && issue.previewFix ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {isPreviewActive ? (
                <button
                  type="button"
                  disabled={isPreviewPending}
                  onClick={() => onRevertPreview(issue.id)}
                  className="min-h-9 rounded-md border border-blue-300 px-3 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-60 dark:border-blue-700 dark:text-blue-200 dark:hover:bg-blue-950"
                >
                  {isPreviewPending ? "正在撤销" : "撤销预览"}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={isPreviewPending}
                    onClick={() => onApplyPreview(issue, issue.previewFix as PreviewFix)}
                    className="min-h-9 rounded-md bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {isPreviewPending ? "正在应用" : "预览修复"}
                  </button>
                  {issue.previewFixOptions?.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      disabled={isPreviewPending}
                      onClick={() => onApplyPreview(issue, option.fix)}
                      className="min-h-9 rounded-md border border-blue-300 px-3 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-60 dark:border-blue-700 dark:text-blue-200 dark:hover:bg-blue-950"
                    >
                      {option.label}
                    </button>
                  ))}
                </>
              )}
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">此问题暂不支持安全的自动预览。</p>
          )}

          {issue.codeSuggestion ? (
            <div className="mt-3">
              <pre className="max-h-40 overflow-auto rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-100">
                <code>{issue.codeSuggestion}</code>
              </pre>
              <button
                type="button"
                onClick={() => onCopy(issue.codeSuggestion ?? "")}
                className="mt-2 min-h-9 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                复制修复代码
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
