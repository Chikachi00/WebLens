import { createIssueId, getElementTag, getVisibleText, isElementVisible } from "../content/domUtils";
import { createStableSelector } from "../content/selector";
import type { AuditIssue, AuditRule } from "../shared/types";

const INTERACTIVE_SELECTOR = [
  "button",
  "a[href]",
  'input[type="button"]',
  'input[type="submit"]',
  'input[type="reset"]',
  '[role="button"]',
  '[role="link"]',
  "summary"
].join(",");

const MIN_ACCESSIBLE_SIZE = 24;
const COMFORTABLE_TOUCH_SIZE = 44;
const TARGET_RADIUS = MIN_ACCESSIBLE_SIZE / 2;
const DESKTOP_FINE_POINTER_MAX_WIDTH = 768;

const INLINE_TEXT_CONTAINERS = new Set(["p", "span", "li", "dd", "dt"]);

export interface TargetGeometry {
  element: Element;
  rect: DOMRect;
  centerX: number;
  centerY: number;
  undersized: boolean;
}

export const touchTargetRule: AuditRule = {
  id: "touch-target",
  title: "目标尺寸或间距不足",
  category: "usability",
  severity: "info",
  supportsPreview: true,
  description: "检测交互目标是否过小、过近，或在触控场景下不够舒适。",
  check: () => {
    const geometries = getInteractiveTargetGeometries();
    const coarsePointer = isCoarsePointer();
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

    return geometries.flatMap<AuditIssue>((geometry, index) => {
      const { element, rect } = geometry;

      if (isInlineTextLink(element)) {
        return [];
      }

      const selector = createStableSelector(element);
      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      const nearestTargetDistance = Math.round(getNearestTargetDistance(geometry, geometries));

      if (geometry.undersized) {
        const hasSpacingException = hasSufficientSpacingException(geometry, geometries);
        if (hasSpacingException) {
          return [];
        }

        return [
          {
            id: createIssueId("touch-target", selector, index),
            ruleId: "touch-target",
            title: "目标尺寸或间距不足",
            severity: "warning",
            description: `该交互目标约为 ${width} × ${height}px，尺寸小于 24px 且与相邻交互目标距离不足。`,
            recommendation:
              "增大目标本身尺寸，或确保相邻交互目标之间留出足够间距。WebLens 使用几何近似判断目标间距，仍建议人工确认。",
            selector,
            elementTag: getElementTag(element),
            codeSuggestion: ".button {\n  min-width: 24px;\n  min-height: 24px;\n}",
            supportsPreview: true,
            previewFix: { type: "style", styles: { "min-width": "44px", "min-height": "44px" } },
            previewBefore: [`当前尺寸：${width} × ${height} px`],
            previewAfter: ["预览尺寸：至少 44 × 44 px"],
            diagnostics: {
              confidence: "medium",
              standard: "WCAG 2.2 2.5.8",
              reasonCode: "undersized-and-insufficient-spacing",
              measured: {
                width,
                height,
                nearestTargetDistance,
                coarsePointer,
                viewportWidth
              },
              note: "间距检测为几何近似结果，建议人工确认。"
            }
          }
        ];
      }

      const needsComfortHint =
        (coarsePointer || viewportWidth <= DESKTOP_FINE_POINTER_MAX_WIDTH) &&
        (rect.width < COMFORTABLE_TOUCH_SIZE || rect.height < COMFORTABLE_TOUCH_SIZE);

      if (!needsComfortHint) {
        return [];
      }

      return [
        {
          id: createIssueId("touch-target", selector, index),
          ruleId: "touch-target",
          title: "触控目标可以更大",
          severity: "info",
          description: `该交互目标约为 ${width} × ${height}px。在触控或窄屏场景下，44 × 44px 以上通常更容易点击。`,
          recommendation: "这不是 WCAG 违规结论，而是触控舒适度建议。可适当增加 padding 或最小尺寸。",
          selector,
          elementTag: getElementTag(element),
          codeSuggestion: ".button {\n  min-width: 44px;\n  min-height: 44px;\n}",
          supportsPreview: true,
          previewFix: { type: "style", styles: { "min-width": "44px", "min-height": "44px" } },
          previewBefore: [`当前尺寸：${width} × ${height} px`],
          previewAfter: ["预览尺寸：至少 44 × 44 px"],
          diagnostics: {
            confidence: "medium",
            reasonCode: "touch-comfort-advisory",
            measured: {
              width,
              height,
              coarsePointer,
              viewportWidth
            },
            note: "44px 是触控舒适度建议，不代表桌面页面必须满足该尺寸。"
          }
        }
      ];
    });
  }
};

export function getInteractiveTargetGeometries(root: ParentNode = document): TargetGeometry[] {
  return Array.from(root.querySelectorAll(INTERACTIVE_SELECTOR))
    .filter(isValidInteractiveTarget)
    .map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        element,
        rect,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
        undersized: rect.width < MIN_ACCESSIBLE_SIZE || rect.height < MIN_ACCESSIBLE_SIZE
      };
    });
}

export function isInlineTextLink(element: Element): boolean {
  if (!(element instanceof HTMLAnchorElement)) {
    return false;
  }

  const style = window.getComputedStyle(element);
  if (style.display !== "inline") {
    return false;
  }

  if (element.querySelector("svg, img") || element.getAttribute("role") === "button") {
    return false;
  }

  const text = getVisibleText(element);
  if (!text) {
    return false;
  }

  const parent = element.parentElement;
  if (!parent || !INLINE_TEXT_CONTAINERS.has(parent.tagName.toLowerCase())) {
    return false;
  }

  return Array.from(parent.childNodes).some((node) => node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim()));
}

export function hasSufficientSpacingException(target: TargetGeometry, allTargets: TargetGeometry[]): boolean {
  return !allTargets.some((candidate) => {
    if (candidate.element === target.element) {
      return false;
    }

    if (candidate.undersized) {
      return getCenterDistance(target, candidate) < TARGET_RADIUS * 2;
    }

    return circleIntersectsRect(target, candidate.rect);
  });
}

export function getNearestTargetDistance(target: TargetGeometry, allTargets: TargetGeometry[]): number {
  const distances = allTargets
    .filter((candidate) => candidate.element !== target.element)
    .map((candidate) => {
      if (candidate.undersized) {
        return Math.max(0, getCenterDistance(target, candidate) - TARGET_RADIUS * 2);
      }

      return getDistanceFromPointToRect(target.centerX, target.centerY, candidate.rect);
    });

  return distances.length > 0 ? Math.min(...distances) : Infinity;
}

function isValidInteractiveTarget(element: Element): boolean {
  if (element.closest('[data-weblens-injected="true"]')) {
    return false;
  }

  if (!isElementVisible(element) || hasInteractiveAncestor(element)) {
    return false;
  }

  if (element.closest("[inert]") || element.getAttribute("aria-hidden") === "true") {
    return false;
  }

  if (element instanceof HTMLButtonElement || element instanceof HTMLInputElement) {
    if (element.disabled) {
      return false;
    }
  }

  const style = window.getComputedStyle(element);
  if (style.pointerEvents === "none") {
    return false;
  }

  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function hasInteractiveAncestor(element: Element): boolean {
  let current = element.parentElement;
  while (current) {
    if (current.matches(INTERACTIVE_SELECTOR)) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

function isCoarsePointer(): boolean {
  try {
    return Boolean(window.matchMedia?.("(pointer: coarse)").matches);
  } catch {
    return false;
  }
}

function getCenterDistance(a: TargetGeometry, b: TargetGeometry): number {
  return Math.hypot(a.centerX - b.centerX, a.centerY - b.centerY);
}

function circleIntersectsRect(circle: TargetGeometry, rect: DOMRect): boolean {
  return getDistanceFromPointToRect(circle.centerX, circle.centerY, rect) < TARGET_RADIUS;
}

function getDistanceFromPointToRect(x: number, y: number, rect: DOMRect): number {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return Math.hypot(dx, dy);
}
