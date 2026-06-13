import { useState } from "react";
import { SeverityBadge } from "./Badge";
import type { AuditIssue } from "../../shared/types";

export function IssueCard({
  issue,
  onLocate,
  onCopy
}: {
  issue: AuditIssue;
  onLocate: (issue: AuditIssue) => void;
  onCopy: (code: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="rounded-md border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start gap-2">
        <SeverityBadge severity={issue.severity} />
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
      </div>

      {expanded ? (
        <div className="mt-3 border-t border-slate-200 pt-3 dark:border-slate-700">
          <p className="text-sm leading-5 text-slate-700 dark:text-slate-200">{issue.recommendation}</p>
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
