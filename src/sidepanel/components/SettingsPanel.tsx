import { IgnoredIssuesList } from "./IgnoredIssuesList";
import { RuleToggleList } from "./RuleToggleList";
import type { WebLensSettings } from "../../shared/types";

export function SettingsPanel({
  open,
  settings,
  onClose,
  onToggleRule,
  onRestoreRules,
  onRemoveIgnored,
  onClearIgnored
}: {
  open: boolean;
  settings: WebLensSettings;
  onClose: () => void;
  onToggleRule: (ruleId: string, enabled: boolean) => void;
  onRestoreRules: () => void;
  onRemoveIgnored: (recordId: string) => void;
  onClearIgnored: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-20 bg-slate-950/30">
      <section className="ml-auto flex h-full w-full max-w-md flex-col bg-slate-50 shadow-xl dark:bg-slate-950">
        <header className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
          <div>
            <h2 className="text-base font-semibold text-slate-950 dark:text-slate-50">设置</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">规则开关和忽略记录仅保存在本地。</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭设置"
            className="min-h-9 rounded-md border border-slate-300 px-3 text-sm text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            关闭
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-auto p-4">
          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-50">检测规则</h3>
              <button
                type="button"
                onClick={onRestoreRules}
                className="min-h-8 rounded-md border border-slate-300 px-2 text-xs font-medium text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                恢复默认规则
              </button>
            </div>
            <RuleToggleList settings={settings} onToggle={onToggleRule} />
          </section>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-950 dark:text-slate-50">已忽略的问题</h3>
            <IgnoredIssuesList records={settings.ignoredIssues} onRemove={onRemoveIgnored} onClearAll={onClearIgnored} />
          </section>
        </div>
      </section>
    </div>
  );
}
