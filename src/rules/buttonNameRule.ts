import {
  createIssueId,
  getElementTag,
  getVisibleText,
  hasAccessibleReference,
  hasMeaningfulImageAlt,
  hasMeaningfulTitle
} from "../content/domUtils";
import { createStableSelector } from "../content/selector";
import type { AuditIssue, AuditRule } from "../shared/types";

export const buttonNameRule: AuditRule = {
  id: "button-name",
  title: "按钮缺少可识别名称",
  category: "accessibility",
  severity: "critical",
  description: "按钮需要可识别名称，让辅助技术能读出它的用途。",
  check: () => {
    return Array.from(document.querySelectorAll("button, [role='button']"))
      .filter((element) => !hasButtonName(element))
      .map<AuditIssue>((element, index) => {
        const selector = createStableSelector(element);

        return {
          id: createIssueId("button-name", selector, index),
          ruleId: "button-name",
          title: "按钮缺少可识别名称",
          severity: "critical",
          description: "该按钮没有可见文本、aria-label、aria-labelledby、有效 title 或图片 alt。",
          recommendation: "为图标按钮添加 aria-label，或提供清晰可见的按钮文本。",
          selector,
          elementTag: getElementTag(element),
          codeSuggestion: '<button aria-label="关闭菜单">\n  <svg>...</svg>\n</button>'
        };
      });
  }
};

function hasButtonName(element: Element): boolean {
  return (
    Boolean(getVisibleText(element)) ||
    hasAccessibleReference(element) ||
    hasMeaningfulTitle(element) ||
    hasMeaningfulImageAlt(element)
  );
}
