import { createIssueId, getElementTag } from "../content/domUtils";
import { createStableSelector } from "../content/selector";
import type { AuditRule } from "../shared/types";

export const documentLanguageRule: AuditRule = {
  id: "document-language",
  title: "HTML 文档缺少语言声明",
  category: "accessibility",
  severity: "info",
  description: "html lang 能帮助浏览器和辅助技术选择正确的语言规则。",
  check: () => {
    const html = document.documentElement;
    if (html.getAttribute("lang")?.trim()) {
      return [];
    }

    const selector = createStableSelector(html);
    return [
      {
        id: createIssueId("document-language", selector, 0),
        ruleId: "document-language",
        title: "HTML 文档缺少 lang",
        severity: "info",
        description: "当前页面的 <html> 元素没有 lang 属性，辅助技术可能无法选择正确朗读语言。",
        recommendation: "根据页面主要语言添加 lang 属性，例如中文页面使用 zh-CN，英文页面使用 en。",
        selector,
        elementTag: getElementTag(html),
        codeSuggestion: '<html lang="zh-CN">'
      }
    ];
  }
};
