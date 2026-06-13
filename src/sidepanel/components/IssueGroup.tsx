import { useState } from "react";
import { SeverityBadge } from "./Badge";
import { IssueCard } from "./IssueCard";
import type { IssueGroupModel } from "../issueGrouping";
import type { AuditIssue, IgnoredIssueRecord, PreviewFix } from "../../shared/types";

interface IssueGroupProps {
  group: IssueGroupModel;
  onLocate: (issue: AuditIssue) => void;
  onCopy: (code: string) => void;
  onIgnore: (issue: AuditIssue, scope: IgnoredIssueRecord["scope"]) => void;
  onApplyPreview: (issue: AuditIssue, fix: PreviewFix) => void;
  onRevertPreview: (issueId: string) => void;
  isPreviewActive: (issueId: string) => boolean;
  pendingIssueId: string | null;
}

export function IssueGroup({
  group,
  onLocate,
  onCopy,
  onIgnore,
  onApplyPreview,
  onRevertPreview,
  isPreviewActive,
  pendingIssueId
}: IssueGroupProps) {
  const [expanded, setExpanded] = useState(group.issues.length === 1);

  return (
    <section className="rounded-md border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start gap-3">
        <SeverityBadge severity={group.severity} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-950 dark:text-slate-50">{group.title}</h2>
              <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">{group.description}</p>
            </div>
            <span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-300">
              {group.issues.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="mt-3 min-h-8 rounded-md border border-slate-300 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            {expanded ? "收起具体元素" : "展开具体元素"}
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="mt-3 space-y-3 border-t border-slate-200 pt-3 dark:border-slate-700">
          {group.issues.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              onLocate={onLocate}
              onCopy={onCopy}
              onIgnore={onIgnore}
              onApplyPreview={onApplyPreview}
              onRevertPreview={onRevertPreview}
              isPreviewActive={isPreviewActive(issue.id)}
              isPreviewPending={pendingIssueId === issue.id}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
