import type { AuditSeverity } from "../../shared/types";

const severityStyles: Record<AuditSeverity, string> = {
  critical: "border-red-200 bg-red-50 text-red-700 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200",
  warning:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/70 dark:bg-orange-950/40 dark:text-orange-200",
  info: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/70 dark:bg-sky-950/40 dark:text-sky-200"
};

const severityLabels: Record<AuditSeverity, string> = {
  critical: "严重",
  warning: "警告",
  info: "提示"
};

export function SeverityBadge({ severity }: { severity: AuditSeverity }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded border px-2 py-0.5 text-xs font-medium ${severityStyles[severity]}`}>
      {severityLabels[severity]}
    </span>
  );
}
