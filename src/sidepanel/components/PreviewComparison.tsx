import type { AuditIssue } from "../../shared/types";

export function PreviewComparison({ issue }: { issue: AuditIssue }) {
  if (!issue.previewBefore?.length && !issue.previewAfter?.length && !issue.previewNote) {
    return null;
  }

  return (
    <div className="mt-3 rounded-md border border-blue-100 bg-blue-50 p-3 text-xs text-blue-950 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
      <div className="grid gap-3 sm:grid-cols-2">
        {issue.previewBefore?.length ? (
          <div>
            <div className="font-semibold">修改前</div>
            {issue.previewBefore.map((line) => (
              <div key={line} className="mt-1 font-mono">
                {line}
              </div>
            ))}
          </div>
        ) : null}
        {issue.previewAfter?.length ? (
          <div>
            <div className="font-semibold">预览后</div>
            {issue.previewAfter.map((line) => (
              <div key={line} className="mt-1 font-mono">
                {line}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {issue.previewNote ? <p className="mt-3 leading-5">{issue.previewNote}</p> : null}
    </div>
  );
}
