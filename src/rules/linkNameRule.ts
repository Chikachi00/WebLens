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
  supportsPreview: true,
  description: "链接需要可识别名称，让用户知道点击后会前往哪里。",
  check: () => {
    return Array.from(document.querySelectorAll("a[href]"))
      .filter((element) => !hasLinkName(element))
      .map<AuditIssue>((element, index) => {
        const selector = createStableSelector(element);
        const label = inferLinkLabel(element);

        return {
          id: createIssueId("link-name", selector, index),
          ruleId: "link-name",
          title: "链接缺少可识别名称",
          severity: "warning",
          description: "该链接没有可见文本、aria-label、aria-labelledby，也没有带有效 alt 的图片。",
          recommendation: "为链接提供可见文本，或在图标链接上添加 aria-label。",
          selector,
          elementTag: getElementTag(element),
          codeSuggestion: '<a href="/settings" aria-label="打开设置">\n  <svg>...</svg>\n</a>',
          supportsPreview: true,
          previewFix: { type: "attribute", attribute: "aria-label", value: label },
          previewBefore: ["aria-label: 未设置"],
          previewAfter: [`aria-label: "${label}"`],
          previewNote: label === "链接说明" ? "该值仅用于预览，请在源码中替换为准确文本。" : undefined
        };
      });
  }
};

function hasLinkName(element: Element): boolean {
  return Boolean(getVisibleText(element)) || hasAccessibleReference(element) || hasMeaningfulImageAlt(element);
}

function inferLinkLabel(element: Element): string {
  const imageAlt = element.querySelector("img")?.getAttribute("alt")?.trim();
  if (imageAlt) {
    return imageAlt;
  }

  const title = element.getAttribute("title")?.trim();
  if (title) {
    return title;
  }

  const href = element.getAttribute("href");
  if (href) {
    try {
      const url = new URL(href, window.location.href);
      const segment = url.pathname
        .split("/")
        .filter(Boolean)
        .pop()
        ?.replace(/[-_]+/g, " ")
        .trim();
      if (segment) {
        return segment;
      }
    } catch {
      return "链接说明";
    }
  }

  return "链接说明";
}
