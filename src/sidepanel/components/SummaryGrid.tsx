import type { AuditSummary } from "../../shared/types";

const items = [
  { key: "total", label: "总数", className: "text-slate-900 dark:text-slate-100" },
  { key: "critical", label: "严重", className: "text-red-600 dark:text-red-300" },
  { key: "warning", label: "警告", className: "text-orange-600 dark:text-orange-300" },
  { key: "info", label: "提示", className: "text-sky-600 dark:text-sky-300" }
] as const;

export function SummaryGrid({ summary }: { summary: AuditSummary }) {
  return (
    <section className="grid grid-cols-4 gap-2">
      {items.map((item) => (
        <div
          key={item.key}
          className="rounded-md border border-slate-200 bg-white p-2 text-center dark:border-slate-700 dark:bg-slate-800"
        >
          <div className={`text-lg font-semibold ${item.className}`}>{summary[item.key]}</div>
          <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{item.label}</div>
        </div>
      ))}
    </section>
  );
}
