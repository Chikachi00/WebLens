import type { AuditSeverity } from "../../shared/types";

export type IssueFilter = "all" | AuditSeverity;

const filters: Array<{ value: IssueFilter; label: string }> = [
  { value: "all", label: "全部" },
  { value: "critical", label: "严重" },
  { value: "warning", label: "警告" },
  { value: "info", label: "提示" }
];

export function FilterTabs({
  value,
  onChange
}: {
  value: IssueFilter;
  onChange: (value: IssueFilter) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-1 rounded-md border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-900">
      {filters.map((filter) => (
        <button
          key={filter.value}
          type="button"
          onClick={() => onChange(filter.value)}
          className={`min-h-9 rounded px-2 text-sm font-medium transition ${
            value === filter.value
              ? "bg-white text-slate-950 shadow-sm dark:bg-slate-700 dark:text-white"
              : "text-slate-600 hover:bg-white/70 dark:text-slate-300 dark:hover:bg-slate-800"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
