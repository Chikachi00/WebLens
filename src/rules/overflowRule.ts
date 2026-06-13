import { createIssueId, getElementTag, isElementVisible } from "../content/domUtils";
import { createStableSelector } from "../content/selector";
import type { AuditIssue, AuditRule } from "../shared/types";

const IGNORED_VISUAL_TAGS = new Set(["script", "style", "meta", "link", "noscript", "template"]);
const OVERFLOW_TOLERANCE = 2;
const MAX_CANDIDATES = 5;

export type OverflowReason =
  | "fixed-width"
  | "min-width"
  | "media-width"
  | "unbreakable-content"
  | "absolute-position"
  | "fixed-position"
  | "transform"
  | "negative-margin"
  | "flex-shrink"
  | "grid-layout"
  | "unknown";

export interface PageOverflowMetrics {
  viewportWidth: number;
  documentScrollWidth: number;
  bodyScrollWidth: number;
  effectiveContentWidth: number;
  overflowAmount: number;
}

export interface OverflowCandidate {
  element: Element;
  leftOverflow: number;
  rightOverflow: number;
  totalOverflow: number;
  position: string;
  width: number;
  reason: OverflowReason;
}

export const overflowRule: AuditRule = {
  id: "horizontal-overflow",
  title: "页面横向溢出",
  category: "layout",
  severity: "warning",
  supportsPreview: false,
  description: "检测页面内容是否意外超出视口，并列出最可能的根因元素。",
  check: () => {
    const metrics = getPageOverflowMetrics();

    if (metrics.overflowAmount <= OVERFLOW_TOLERANCE) {
      return [];
    }

    const candidates = findOverflowCandidates(metrics.viewportWidth).slice(0, MAX_CANDIDATES);
    const targets = candidates.length > 0 ? candidates : [createDocumentCandidate(metrics)];
    const candidateSummary = formatCandidateSummary(candidates);

    return targets.map<AuditIssue>((candidate, index) => {
      const selector = createStableSelector(candidate.element);
      const overflowSide =
        candidate.rightOverflow >= candidate.leftOverflow ? `向右溢出约 ${Math.round(candidate.rightOverflow)}px` : `向左溢出约 ${Math.round(candidate.leftOverflow)}px`;

      return {
        id: createIssueId("horizontal-overflow", selector, index),
        ruleId: "horizontal-overflow",
        title: "页面存在横向溢出",
        severity: "warning",
        description: `页面${overflowSide}。视口宽度 ${Math.round(metrics.viewportWidth)}px，实际内容宽度 ${Math.round(
          metrics.effectiveContentWidth
        )}px。${candidateSummary}`,
        recommendation:
          "检查固定宽度、过大的 min-width、媒体元素、长文本、绝对定位、transform、负 margin 或 flex/grid 约束。不要用 overflow-x: hidden 掩盖根因。",
        selector,
        elementTag: getElementTag(candidate.element),
        codeSuggestion: ".container {\n  max-width: 100%;\n  overflow-wrap: anywhere;\n}\n\nimg,\nvideo {\n  max-width: 100%;\n  height: auto;\n}",
        diagnostics: {
          confidence: candidate.reason === "unknown" ? "medium" : "high",
          reasonCode: candidate.reason,
          measured: {
            viewportWidth: Math.round(metrics.viewportWidth),
            documentScrollWidth: Math.round(metrics.documentScrollWidth),
            bodyScrollWidth: Math.round(metrics.bodyScrollWidth),
            effectiveContentWidth: Math.round(metrics.effectiveContentWidth),
            overflowAmount: Math.round(metrics.overflowAmount),
            candidateWidth: Math.round(candidate.width),
            leftOverflow: Math.round(candidate.leftOverflow),
            rightOverflow: Math.round(candidate.rightOverflow),
            totalOverflow: Math.round(candidate.totalOverflow),
            position: candidate.position
          },
          note: "可疑元素按溢出量排序并进行祖先/后代去重，仍建议结合页面布局人工确认。"
        }
      };
    });
  }
};

export function getPageOverflowMetrics(): PageOverflowMetrics {
  const documentElement = document.documentElement;
  const body = document.body;
  const documentScrollWidth = documentElement.scrollWidth;
  const bodyScrollWidth = body?.scrollWidth ?? 0;
  const effectiveContentWidth = Math.max(documentScrollWidth, bodyScrollWidth);
  const viewportCandidates = [
    documentElement.clientWidth,
    window.innerWidth,
    window.visualViewport?.width ?? 0
  ].filter((value) => value > 0);
  const viewportWidth = viewportCandidates.length > 0 ? Math.min(...viewportCandidates) : documentElement.clientWidth;

  return {
    viewportWidth,
    documentScrollWidth,
    bodyScrollWidth,
    effectiveContentWidth,
    overflowAmount: Math.max(0, effectiveContentWidth - viewportWidth)
  };
}

export function findOverflowCandidates(viewportWidth = getPageOverflowMetrics().viewportWidth): OverflowCandidate[] {
  const candidates = Array.from(document.body?.querySelectorAll("*:not([data-weblens-injected='true'])") ?? [])
    .map((element) => createOverflowCandidate(element, viewportWidth))
    .filter((candidate): candidate is OverflowCandidate => Boolean(candidate))
    .sort((a, b) => b.totalOverflow - a.totalOverflow || b.width - a.width);

  return dedupeRelatedCandidates(candidates).slice(0, MAX_CANDIDATES);
}

function createOverflowCandidate(element: Element, viewportWidth: number): OverflowCandidate | null {
  const tagName = element.tagName.toLowerCase();
  if (IGNORED_VISUAL_TAGS.has(tagName) || element.closest('[data-weblens-injected="true"]') || !isElementVisible(element)) {
    return null;
  }

  if (isInsideReasonableHorizontalScroller(element)) {
    return null;
  }

  const rect = element.getBoundingClientRect();
  const leftOverflow = Math.max(0, -rect.left);
  const rightOverflow = Math.max(0, rect.right - viewportWidth);
  const totalOverflow = leftOverflow + rightOverflow;

  if (totalOverflow <= OVERFLOW_TOLERANCE) {
    return null;
  }

  const style = window.getComputedStyle(element);
  return {
    element,
    leftOverflow,
    rightOverflow,
    totalOverflow,
    position: style.position,
    width: rect.width,
    reason: detectOverflowReason(element, style, rect, viewportWidth)
  };
}

function isInsideReasonableHorizontalScroller(element: Element): boolean {
  let current = element.parentElement;

  while (current && current !== document.body && current !== document.documentElement) {
    const style = window.getComputedStyle(current);
    const allowsHorizontalScroll = ["auto", "scroll"].includes(style.overflowX);
    if (allowsHorizontalScroll && current.scrollWidth > current.clientWidth + OVERFLOW_TOLERANCE) {
      return true;
    }

    current = current.parentElement;
  }

  return false;
}

function detectOverflowReason(element: Element, style: CSSStyleDeclaration, rect: DOMRect, viewportWidth: number): OverflowReason {
  const width = parseCssPixels(style.width);
  const minWidth = parseCssPixels(style.minWidth);
  const marginLeft = parseCssPixels(style.marginLeft);
  const marginRight = parseCssPixels(style.marginRight);

  if (style.position === "fixed") return "fixed-position";
  if (style.position === "absolute") return "absolute-position";
  if (style.transform && style.transform !== "none") return "transform";
  if (marginLeft < 0 || marginRight < 0) return "negative-margin";
  if (minWidth > viewportWidth) return "min-width";
  if (width > viewportWidth || rect.width > viewportWidth) return "fixed-width";
  if (element.matches("img, video, canvas, svg")) return "media-width";
  if (hasUnbreakableContent(element)) return "unbreakable-content";
  if (style.flexShrink === "0") return "flex-shrink";
  if (style.display.includes("grid") || style.gridTemplateColumns.includes("px")) return "grid-layout";

  return "unknown";
}

function hasUnbreakableContent(element: Element): boolean {
  const text = (element.textContent ?? "").trim();
  return /\S{40,}/.test(text);
}

function parseCssPixels(value: string): number {
  if (!value || value === "auto" || value === "none") {
    return 0;
  }

  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function dedupeRelatedCandidates(candidates: OverflowCandidate[]): OverflowCandidate[] {
  const kept: OverflowCandidate[] = [];

  for (const candidate of candidates) {
    const isRelatedToKept = kept.some(
      (existing) => existing.element.contains(candidate.element) || candidate.element.contains(existing.element)
    );
    if (!isRelatedToKept) {
      kept.push(candidate);
    }
  }

  return kept;
}

function createDocumentCandidate(metrics: PageOverflowMetrics): OverflowCandidate {
  return {
    element: document.documentElement,
    leftOverflow: 0,
    rightOverflow: metrics.overflowAmount,
    totalOverflow: metrics.overflowAmount,
    position: "static",
    width: metrics.effectiveContentWidth,
    reason: "unknown"
  };
}

function formatCandidateSummary(candidates: OverflowCandidate[]): string {
  if (candidates.length === 0) {
    return "未能定位到明确的单个根因元素。";
  }

  const summary = candidates
    .map((candidate, index) => {
      const selector = createStableSelector(candidate.element);
      return `${index + 1}. ${selector} — 超出 ${Math.round(candidate.totalOverflow)}px`;
    })
    .join("；");

  return `可疑溢出元素：${summary}`;
}
