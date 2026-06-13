import {
  createIssueId,
  getElementTag,
  getVisibleText,
  hasAccessibleReference,
  hasMeaningfulImageAlt
} from "../content/domUtils";
import { createStableSelector } from "../content/selector";
import type { AuditIssue, AuditRule } from "../shared/types";

export const linkNameRule: AuditRule = {
  id: "link-name",
  title: "链接缺少可识别名称",
  category: "accessibility",
  severity: "warning",
  description: "链接需要可识别名称，让用户知道点击后会前往哪里。",
  check: () => {
    return Array.from(document.querySelectorAll("a[href]"))
      .filter((element) => !hasLinkName(element))
      .map<AuditIssue>((element, index) => {
        const selector = createStableSelector(element);

        return {
          id: createIssueId("link-name", selector, index),
          ruleId: "link-name",
          title: "链接缺少可识别名称",
          severity: "warning",
          description: "该链接没有可见文本、aria-label、aria-labelledby，也没有带有效 alt 的图片。",
          recommendation: "为链接提供可见文本，或在图标链接上添加 aria-label。",
          selector,
          elementTag: getElementTag(element),
          codeSuggestion: '<a href="/settings" aria-label="打开设置">\n  <svg>...</svg>\n</a>'
        };
      });
  }
};

function hasLinkName(element: Element): boolean {
  return Boolean(getVisibleText(element)) || hasAccessibleReference(element) || hasMeaningfulImageAlt(element);
}
