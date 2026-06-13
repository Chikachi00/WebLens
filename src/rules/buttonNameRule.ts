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
  supportsPreview: true,
  description: "按钮需要可识别名称，让辅助技术能读出它的用途。",
  check: () => {
    return Array.from(document.querySelectorAll("button, [role='button']"))
      .filter((element) => !hasButtonName(element))
      .map<AuditIssue>((element, index) => {
        const selector = createStableSelector(element);
        const label = inferButtonLabel(element);

        return {
          id: createIssueId("button-name", selector, index),
          ruleId: "button-name",
          title: "按钮缺少可识别名称",
          severity: "critical",
          description: "该按钮没有可见文本、aria-label、aria-labelledby、有效 title 或图片 alt。",
          recommendation: "为图标按钮添加 aria-label，或提供清晰可见的按钮文本。",
          selector,
          elementTag: getElementTag(element),
          codeSuggestion: '<button aria-label="关闭菜单">\n  <svg>...</svg>\n</button>',
          supportsPreview: true,
          previewFix: { type: "attribute", attribute: "aria-label", value: label },
          previewBefore: ["aria-label: 未设置"],
          previewAfter: [`aria-label: "${label}"`],
          previewNote: label === "按钮说明" ? "该值仅用于预览，请在源码中替换为准确文本。" : undefined
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

function inferButtonLabel(element: Element): string {
  const title = element.getAttribute("title")?.trim();
  if (title) {
    return title;
  }

  const svgTitle = element.querySelector("svg title")?.textContent?.trim();
  if (svgTitle) {
    return svgTitle;
  }

  const className = Array.from(element.classList).join(" ").toLowerCase();
  if (className.includes("close")) return "关闭";
  if (className.includes("menu")) return "打开菜单";
  if (className.includes("search")) return "搜索";
  if (className.includes("delete") || className.includes("remove")) return "删除";

  return "按钮说明";
}
