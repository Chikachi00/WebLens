export function ExportMenu({
  disabled,
  onExportMarkdown,
  onExportJson
}: {
  disabled: boolean;
  onExportMarkdown: () => void;
  onExportJson: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={onExportMarkdown}
        className="min-h-9 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        导出 Markdown
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={onExportJson}
        className="min-h-9 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        导出 JSON
      </button>
    </div>
  );
}
