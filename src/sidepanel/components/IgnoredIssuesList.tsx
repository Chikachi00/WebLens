import { getRuleTitle } from "../../shared/ruleMetadata";
import type { IgnoredIssueRecord } from "../../shared/types";

export function IgnoredIssuesList({
  records,
  onRemove,
  onClearAll
}: {
  records: IgnoredIssueRecord[];
  onRemove: (recordId: string) => void;
  onClearAll: () => void;
}) {
  if (records.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 p-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        还没有忽略记录。
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {records.map((record) => (
        <div
          key={record.id}
          className="rounded-md border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <div className="font-medium text-slate-950 dark:text-slate-50">{record.ruleTitle || getRuleTitle(record.ruleId)}</div>
          <div className="mt-1 break-all font-mono text-xs text-slate-500 dark:text-slate-400">{record.selector}</div>
          <div className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
            <div>
              {record.scope === "page" ? "当前页面" : "当前网站"}：{record.target}
            </div>
            <div>创建时间：{formatDate(record.createdAt)}</div>
          </div>
          <button
            type="button"
            onClick={() => onRemove(record.id)}
            className="mt-2 min-h-8 rounded-md border border-slate-300 px-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            删除
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="min-h-9 w-full rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-200 dark:hover:bg-red-950"
      >
        清除全部忽略记录
      </button>
    </div>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "未知时间";
  }

  return date.toLocaleString();
}
