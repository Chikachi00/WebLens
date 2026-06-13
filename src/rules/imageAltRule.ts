import { createIssueId, getElementTag } from "../content/domUtils";
import { createStableSelector } from "../content/selector";
import type { AuditIssue, AuditRule } from "../shared/types";

export const imageAltRule: AuditRule = {
  id: "image-alt",
  title: "图片缺少替代文本",
  category: "accessibility",
  severity: "warning",
  supportsPreview: true,
  description: "图片需要 alt 属性帮助屏幕阅读器理解内容。空 alt 可能是装饰性图片，因此仅记录缺少 alt 的图片。",
  check: () => {
    return Array.from(document.querySelectorAll("img:not([alt])")).map<AuditIssue>((image, index) => {
      const selector = createStableSelector(image);

      return {
        id: createIssueId("image-alt", selector, index),
        ruleId: "image-alt",
        title: "图片缺少 alt 属性",
        severity: "warning",
        description: "该图片没有 alt 属性，使用辅助技术的用户可能无法理解图片内容。",
        recommendation: "为有内容含义的图片添加简短、准确的 alt 文本；如果图片只是装饰，也应显式使用空 alt。",
        selector,
        elementTag: getElementTag(image),
        codeSuggestion: '<img src="example.jpg" alt="描述图片内容">',
        supportsPreview: true,
        previewFix: { type: "attribute", attribute: "alt", value: "图片描述" },
        previewFixOptions: [
          {
            label: "内容图片：添加占位描述",
            fix: { type: "attribute", attribute: "alt", value: "图片描述" },
            note: "这是占位预览，正式修复时应根据图片内容填写准确描述。"
          },
          {
            label: "装饰图片：设置空 alt",
            fix: { type: "attribute", attribute: "alt", value: "" },
            note: "仅当图片没有信息含义、纯装饰时才应使用空 alt。"
          }
        ],
        previewBefore: ["alt: 未设置"],
        previewAfter: ['alt: "图片描述"'],
        previewNote: "这是占位预览，正式修复时应根据图片内容填写准确描述。"
      };
    });
  }
};
