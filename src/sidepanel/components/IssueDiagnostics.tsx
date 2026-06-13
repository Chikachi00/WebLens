import type { AuditDiagnostics } from "../../shared/types";

const confidenceLabel: Record<AuditDiagnostics["confidence"], string> = {
  high: "高",
  medium: "中",
  low: "低"
};

const measurementLabel: Record<string, string> = {
  width: "当前宽度",
  height: "当前高度",
  nearestTargetDistance: "最近交互元素间距",
  coarsePointer: "触控指针",
  viewportWidth: "视口宽度",
  documentScrollWidth: "HTML scrollWidth",
  bodyScrollWidth: "Body scrollWidth",
  effectiveContentWidth: "实际内容宽度",
  overflowAmount: "横向溢出量",
  candidateWidth: "候选元素宽度",
  leftOverflow: "左侧溢出",
  rightOverflow: "右侧溢出",
  totalOverflow: "总溢出量",
  position: "定位方式"
};

export function IssueDiagnostics({ diagnostics }: { diagnostics?: AuditDiagnostics }) {
  if (!diagnostics) {
    return null;
  }

  return (
    <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
      <div className="font-semibold text-slate-800 dark:text-slate-100">检测依据</div>
      <dl className="mt-2 grid grid-cols-1 gap-1">
        {diagnostics.standard ? (
          <div className="flex justify-between gap-3">
            <dt>参考标准</dt>
            <dd className="text-right font-medium">{diagnostics.standard}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-3">
          <dt>置信度</dt>
          <dd className="text-right font-medium">{confidenceLabel[diagnostics.confidence]}</dd>
        </div>
        {diagnostics.reasonCode ? (
          <div className="flex justify-between gap-3">
            <dt>原因代码</dt>
            <dd className="break-all text-right font-mono">{diagnostics.reasonCode}</dd>
          </div>
        ) : null}
        {Object.entries(diagnostics.measured ?? {}).map(([key, value]) => (
          <div key={key} className="flex justify-between gap-3">
            <dt>{measurementLabel[key] ?? key}</dt>
            <dd className="text-right font-medium">{formatMeasuredValue(key, value)}</dd>
          </div>
        ))}
      </dl>
      {diagnostics.note ? <p className="mt-2 text-slate-500 dark:text-slate-400">{diagnostics.note}</p> : null}
    </div>
  );
}

function formatMeasuredValue(key: string, value: string | number | boolean): string {
  if (typeof value === "boolean") {
    return value ? "是" : "否";
  }

  if (typeof value === "number") {
    const rounded = Number.isInteger(value) ? value : Math.round(value * 10) / 10;
    if (
      key.toLowerCase().includes("width") ||
      key.toLowerCase().includes("height") ||
      key.toLowerCase().includes("distance") ||
      key.toLowerCase().includes("overflow")
    ) {
      return `${rounded}px`;
    }
    return String(rounded);
  }

  return value;
}
