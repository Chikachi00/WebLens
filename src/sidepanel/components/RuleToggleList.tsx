import { RULE_METADATA } from "../../shared/ruleMetadata";
import type { WebLensSettings } from "../../shared/types";
import { SeverityBadge } from "./Badge";

export function RuleToggleList({
  settings,
  onToggle
}: {
  settings: WebLensSettings;
  onToggle: (ruleId: string, enabled: boolean) => void;
}) {
  const disabled = new Set(settings.disabledRuleIds);

  return (
    <div className="space-y-2">
      {RULE_METADATA.map((rule) => {
        const enabled = !disabled.has(rule.id);
        return (
          <div
            key={rule.id}
            className="rounded-md border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-950 dark:text-slate-50">{rule.title}</h3>
                  <SeverityBadge severity={rule.severity} />
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{rule.description}</p>
              </div>
              <label className="inline-flex min-h-9 shrink-0 items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(event) => onToggle(rule.id, event.target.checked)}
                  className="size-4 accent-blue-600"
                />
                {enabled ? "启用" : "关闭"}
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
}
