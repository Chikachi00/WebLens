import { createIssueId, getElementTag, isElementVisible } from "../content/domUtils";
import { createStableSelector } from "../content/selector";
import type { AuditIssue, AuditRule } from "../shared/types";

const IGNORED_VISUAL_TAGS = new Set(["script", "style", "meta", "link", "noscript", "template"]);

export const overflowRule: AuditRule = {
  id: "horizontal-overflow",
  title: "页面横向溢出",
  category: "layout",
  severity: "warning",
  supportsPreview: false,
  description: "页面内容宽度不应意外超出视口宽度。",
  check: () => {
    const viewportWidth = document.documentElement.clientWidth;
    const contentWidth = document.documentElement.scrollWidth;

    if (contentWidth <= viewportWidth) {
      return [];
    }

    const suspiciousElements = findOverflowElements(viewportWidth).slice(0, 5);
    const targets = suspiciousElements.length > 0 ? suspiciousElements : [document.documentElement];

    return targets.map<AuditIssue>((element, index) => {
      const selector = createStableSelector(element);

      return {
        id: createIssueId("horizontal-overflow", selector, index),
        ruleId: "horizontal-overflow",
        title: "页面存在横向溢出",
        severity: "warning",
        description: `视口宽度为 ${viewportWidth}px，页面实际内容宽度为 ${contentWidth}px。该元素可能导致页面出现横向滚动。`,
        recommendation: "检查固定宽度、绝对定位、长文本、图片或 flex/grid 子项，必要时使用 max-width: 100%、overflow-wrap 或调整布局约束。",
        selector,
        elementTag: getElementTag(element),
        codeSuggestion: ".container {\n  max-width: 100%;\n  overflow-wrap: anywhere;\n}"
      };
    });
  }
};

function findOverflowElements(viewportWidth: number): Element[] {
    return Array.from(document.body.querySelectorAll("*:not([data-weblens-injected='true'])")).filter((element) => {
    const tagName = element.tagName.toLowerCase();
    if (IGNORED_VISUAL_TAGS.has(tagName) || !isElementVisible(element) || isInsideHorizontalScroller(element)) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    return rect.right > viewportWidth + 1 || rect.left < -1;
  });
}

function isInsideHorizontalScroller(element: Element): boolean {
  let current = element.parentElement;

  while (current && current !== document.body) {
    const style = window.getComputedStyle(current);
    const allowsHorizontalScroll = ["auto", "scroll"].includes(style.overflowX);
    if (allowsHorizontalScroll && current.scrollWidth > current.clientWidth) {
      return true;
    }

    current = current.parentElement;
  }

  return false;
}
