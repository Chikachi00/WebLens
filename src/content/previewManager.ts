import type { ActivePreview, PreviewActionResult, PreviewFix, PreviewOperation } from "../shared/types";
import { removeAllPreviewOverlays, removePreviewOverlay, showPreviewOverlay } from "./previewOverlay";

interface OriginalStyleValue {
  value: string;
  priority: string;
  existed: boolean;
}

interface OriginalAttributeValue {
  value: string | null;
  existed: boolean;
}

interface StyleMutation {
  issueId: string;
  value: string;
  priority: string;
}

interface AttributeMutation {
  issueId: string;
  value: string;
}

interface StyleStack {
  original: OriginalStyleValue;
  mutations: StyleMutation[];
}

interface AttributeStack {
  original: OriginalAttributeValue;
  mutations: AttributeMutation[];
}

interface InternalPreview extends ActivePreview {
  element: Element;
  styleProperties: string[];
  attributes: string[];
}

const activePreviews = new Map<string, InternalPreview>();
const styleStacks = new WeakMap<Element, Map<string, StyleStack>>();
const attributeStacks = new WeakMap<Element, Map<string, AttributeStack>>();

export function applyFixPreview(issueId: string, ruleId: string, selector: string, fix: PreviewFix): PreviewActionResult {
  if (activePreviews.has(issueId)) {
    return {
      success: true,
      issueId,
      message: "该问题已经处于预览状态。",
      activePreviewCount: activePreviews.size
    };
  }

  const validation = validatePreviewFix(selector, fix);
  if (!validation.valid) {
    return failure(issueId, validation.error || "预览修复未通过安全校验。");
  }

  const element = document.querySelector(selector);
  if (!element) {
    return failure(issueId, "页面内容已经变化，原预览元素不存在。");
  }

  const styleProperties: string[] = [];
  const attributes: string[] = [];

  for (const operation of flattenPreviewOperations(fix)) {
    if (operation.type === "style") {
      for (const [property, value] of Object.entries(operation.styles)) {
        applyStyleMutation(element as HTMLElement, issueId, property, value);
        styleProperties.push(property);
      }
    } else {
      applyAttributeMutation(element, issueId, operation.attribute, operation.value);
      attributes.push(operation.attribute);
    }
  }

  activePreviews.set(issueId, {
    issueId,
    ruleId,
    selector,
    appliedAt: new Date().toISOString(),
    fix,
    element,
    styleProperties,
    attributes
  });
  element.scrollIntoView?.({ behavior: "smooth", block: "center" });
  showPreviewOverlay(issueId, element);

  return {
    success: true,
    issueId,
    message: "已应用临时修复预览。",
    activePreviewCount: activePreviews.size
  };
}

export function revertFixPreview(issueId: string): PreviewActionResult {
  const preview = activePreviews.get(issueId);
  if (!preview) {
    return {
      success: true,
      issueId,
      message: "该问题没有活动预览。",
      activePreviewCount: activePreviews.size
    };
  }

  activePreviews.delete(issueId);

  if (!preview.element.isConnected) {
    removePreviewOverlay(issueId);
    return failure(issueId, "页面内容已经变化，原预览元素不存在。");
  }

  for (const property of preview.styleProperties) {
    revertStyleMutation(preview.element as HTMLElement, issueId, property);
  }
  for (const attribute of preview.attributes) {
    revertAttributeMutation(preview.element, issueId, attribute);
  }

  removePreviewOverlay(issueId, preview.element, hasOtherPreviewsForElement(preview.element));

  return {
    success: true,
    issueId,
    message: "已撤销预览。",
    activePreviewCount: activePreviews.size
  };
}

export function revertAllFixPreviews(): PreviewActionResult {
  const issueIds = Array.from(activePreviews.keys()).reverse();
  for (const issueId of issueIds) {
    revertFixPreview(issueId);
  }
  removeAllPreviewOverlays();

  return {
    success: true,
    message: "已撤销全部预览。",
    activePreviewCount: activePreviews.size
  };
}

export function getActiveFixPreviews(): ActivePreview[] {
  return Array.from(activePreviews.values()).map(({ element: _element, styleProperties: _styles, attributes: _attrs, ...preview }) => preview);
}

function applyStyleMutation(element: HTMLElement, issueId: string, property: string, value: string): void {
  let propertyStacks = styleStacks.get(element);
  if (!propertyStacks) {
    propertyStacks = new Map();
    styleStacks.set(element, propertyStacks);
  }

  let stack = propertyStacks.get(property);
  if (!stack) {
    const originalValue = element.style.getPropertyValue(property);
    const originalPriority = element.style.getPropertyPriority(property);
    stack = {
      original: {
        value: originalValue,
        priority: originalPriority,
        existed: originalValue !== "" || originalPriority !== ""
      },
      mutations: []
    };
    propertyStacks.set(property, stack);
  }

  stack.mutations.push({ issueId, value, priority: "" });
  element.style.setProperty(property, value);
}

function revertStyleMutation(element: HTMLElement, issueId: string, property: string): void {
  const propertyStacks = styleStacks.get(element);
  const stack = propertyStacks?.get(property);
  if (!stack) {
    return;
  }

  stack.mutations = stack.mutations.filter((mutation) => mutation.issueId !== issueId);
  const next = stack.mutations.at(-1);
  if (next) {
    element.style.setProperty(property, next.value, next.priority);
    return;
  }

  if (stack.original.existed) {
    element.style.setProperty(property, stack.original.value, stack.original.priority);
  } else {
    element.style.removeProperty(property);
  }
  propertyStacks?.delete(property);
}

function applyAttributeMutation(element: Element, issueId: string, attribute: string, value: string): void {
  let elementStacks = attributeStacks.get(element);
  if (!elementStacks) {
    elementStacks = new Map();
    attributeStacks.set(element, elementStacks);
  }

  let stack = elementStacks.get(attribute);
  if (!stack) {
    stack = {
      original: {
        value: element.getAttribute(attribute),
        existed: element.hasAttribute(attribute)
      },
      mutations: []
    };
    elementStacks.set(attribute, stack);
  }

  stack.mutations.push({ issueId, value });
  element.setAttribute(attribute, value);
}

function revertAttributeMutation(element: Element, issueId: string, attribute: string): void {
  const elementStacks = attributeStacks.get(element);
  const stack = elementStacks?.get(attribute);
  if (!stack) {
    return;
  }

  stack.mutations = stack.mutations.filter((mutation) => mutation.issueId !== issueId);
  const next = stack.mutations.at(-1);
  if (next) {
    element.setAttribute(attribute, next.value);
    return;
  }

  if (stack.original.existed) {
    element.setAttribute(attribute, stack.original.value ?? "");
  } else {
    element.removeAttribute(attribute);
  }
  elementStacks?.delete(attribute);
}

function hasOtherPreviewsForElement(element: Element): boolean {
  return Array.from(activePreviews.values()).some((preview) => preview.element === element);
}

function failure(issueId: string, message: string): PreviewActionResult {
  return {
    success: false,
    issueId,
    message,
    activePreviewCount: activePreviews.size
  };
}

const ALLOWED_PREVIEW_STYLE_PROPERTIES = ["min-width", "min-height", "display", "align-items", "justify-content"];
const ALLOWED_PREVIEW_ATTRIBUTES = ["alt", "aria-label", "lang"];
const SAFE_STYLE_VALUE_PATTERN = /^[\w\s.%#(),-]+$/;
const SAFE_ATTRIBUTE_VALUE_PATTERN = /^[^<>"`]*$/;

function validatePreviewFix(selector: string, fix: PreviewFix): { valid: boolean; error?: string } {
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

function flattenPreviewOperations(fix: PreviewFix): PreviewOperation[] {
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
