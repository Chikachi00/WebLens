export function PreviewStatusBar({ count, onRevertAll }: { count: number; onRevertAll: () => void }) {
  if (count === 0) {
    return null;
  }

  return (
    <section className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold">正在预览 {count} 项临时修复</div>
          <div className="mt-1 text-xs">预览只作用于当前页面，刷新后会自动消失。</div>
        </div>
        <button
          type="button"
          onClick={onRevertAll}
          className="min-h-9 shrink-0 rounded-md border border-blue-300 px-3 text-sm font-medium hover:bg-blue-100 dark:border-blue-700 dark:hover:bg-blue-900"
        >
          全部撤销
        </button>
      </div>
    </section>
  );
}
