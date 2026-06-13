import type { PreviewFix, PreviewOperation } from "./types";

export const ALLOWED_PREVIEW_STYLE_PROPERTIES = [
  "min-width",
  "min-height",
  "display",
  "align-items",
  "justify-content"
];

export const ALLOWED_PREVIEW_ATTRIBUTES = ["alt", "aria-label", "lang"];

const SAFE_STYLE_VALUE_PATTERN = /^[\w\s.%#(),-]+$/;
const SAFE_ATTRIBUTE_VALUE_PATTERN = /^[^<>"`]*$/;

export function validatePreviewFix(selector: string, fix: PreviewFix): { valid: boolean; error?: string } {
  if (!selector.trim()) {
    return { valid: false, error: "缺少目标 selector。" };
  }

  const operations = flattenPreviewOperations(fix);
  if (operations.length === 0) {
    return { valid: false, error: "预览修复为空。" };
  }

  for (const operation of operations) {
    if (operation.type === "style") {
      for (const [property, value] of Object.entries(operation.styles)) {
        if (!ALLOWED_PREVIEW_STYLE_PROPERTIES.includes(property)) {
          return { valid: false, error: `不允许预览修改样式 ${property}。` };
        }
        if (!value || !SAFE_STYLE_VALUE_PATTERN.test(value)) {
          return { valid: false, error: `样式 ${property} 的值不安全。` };
        }
      }
    } else if (operation.type === "attribute") {
      if (!ALLOWED_PREVIEW_ATTRIBUTES.includes(operation.attribute) || operation.attribute.startsWith("on")) {
        return { valid: false, error: `不允许预览修改属性 ${operation.attribute}。` };
      }
      if (!SAFE_ATTRIBUTE_VALUE_PATTERN.test(operation.value)) {
        return { valid: false, error: `属性 ${operation.attribute} 的值不安全。` };
      }
    } else {
      return { valid: false, error: "不支持的预览修复类型。" };
    }
  }

  return { valid: true };
}

export function flattenPreviewOperations(fix: PreviewFix): PreviewOperation[] {
  if (fix.type === "style") {
    return [{ type: "style", styles: fix.styles }];
  }

  if (fix.type === "attribute") {
    return [{ type: "attribute", attribute: fix.attribute, value: fix.value }];
  }

  if (fix.type === "composite") {
    return fix.operations;
  }

  return [];
}

export function getPreviewType(fix?: PreviewFix): string | undefined {
  if (!fix) {
    return undefined;
  }

  return fix.type;
}
