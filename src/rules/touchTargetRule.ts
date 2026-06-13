import { createIssueId, getElementTag, isElementVisible } from "../content/domUtils";
import { createStableSelector } from "../content/selector";
import type { AuditIssue, AuditRule, AuditSeverity } from "../shared/types";

const MIN_TARGET_SIZE = 40;

export const touchTargetRule: AuditRule = {
  id: "touch-target",
  title: "交互元素点击区域过小",
  category: "usability",
  severity: "info",
  supportsPreview: true,
  description: "过小的点击区域会增加触控设备上的误操作概率。",
  check: () => {
    const elements = Array.from(
      document.querySelectorAll('button, a[href], input[type="button"], input[type="submit"], [role="button"]')
    ).filter(isElementVisible);

    return elements
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && (rect.width < MIN_TARGET_SIZE || rect.height < MIN_TARGET_SIZE);
      })
      .map<AuditIssue>((element, index) => {
        const selector = createStableSelector(element);
        const rect = element.getBoundingClientRect();
        const severity = getTargetSeverity(element);

        return {
          id: createIssueId("touch-target", selector, index),
          ruleId: "touch-target",
          title: "点击区域可能过小",
          severity,
          description: `该交互元素尺寸约为 ${Math.round(rect.width)}px x ${Math.round(rect.height)}px，可能不便于触控点击。`,
          recommendation: "为按钮和图标操作增加内边距或最小尺寸。普通文本链接可以结合上下文判断是否需要调整。",
          selector,
          elementTag: getElementTag(element),
          codeSuggestion: ".button {\n  min-width: 44px;\n  min-height: 44px;\n}",
          supportsPreview: true,
          previewFix: { type: "style", styles: { "min-width": "44px", "min-height": "44px" } },
          previewBefore: [`当前尺寸：${Math.round(rect.width)} x ${Math.round(rect.height)} px`],
          previewAfter: ["预览尺寸：至少 44 x 44 px"]
        };
      });
  }
};

function getTargetSeverity(element: Element): AuditSeverity {
  if (element.matches("button, input, [role='button']")) {
    return "warning";
  }

  return "info";
}
