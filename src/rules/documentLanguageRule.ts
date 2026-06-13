import { createIssueId, getElementTag } from "../content/domUtils";
import { createStableSelector } from "../content/selector";
import type { AuditRule } from "../shared/types";

export const documentLanguageRule: AuditRule = {
  id: "document-language",
  title: "HTML 文档缺少语言声明",
  category: "accessibility",
  severity: "info",
  supportsPreview: true,
  description: "html lang 能帮助浏览器和辅助技术选择正确的语言规则。",
  check: () => {
    const html = document.documentElement;
    if (html.getAttribute("lang")?.trim()) {
      return [];
    }

    const selector = createStableSelector(html);
    const suggestedLang = inferDocumentLanguage();
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
        codeSuggestion: `<html lang="${suggestedLang}">`,
        supportsPreview: true,
        previewFix: { type: "attribute", attribute: "lang", value: suggestedLang },
        previewBefore: ["lang: 未设置"],
        previewAfter: [`lang: "${suggestedLang}"`],
        previewNote: suggestedLang === "en" ? "语言推断不确定时默认建议 en，请手动确认页面主要语言。" : undefined
      }
    ];
  }
};

function inferDocumentLanguage(): string {
  const sample = `${document.title} ${document.body?.innerText ?? ""}`.slice(0, 3000);
  const cjkMatches = sample.match(/[\u4e00-\u9fff]/g)?.length ?? 0;
  const latinMatches = sample.match(/[A-Za-z]/g)?.length ?? 0;

  if (cjkMatches > 0 && cjkMatches >= latinMatches * 0.3) {
    return "zh-CN";
  }

  return "en";
}
