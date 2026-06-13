import { createIssueId, getElementTag } from "../content/domUtils";
import { findHeadingLevelJumps } from "../content/headingOrder";
import { createStableSelector } from "../content/selector";
import type { AuditIssue, AuditRule } from "../shared/types";

export const headingOrderRule: AuditRule = {
  id: "heading-order",
  title: "标题层级跳跃",
  category: "semantics",
  severity: "warning",
  description: "标题层级应反映页面结构，避免从较高层级直接跳到过深层级。",
  check: () => {
    const headingElements = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"));
    const headings = headingElements.map((heading) => ({
      level: Number(heading.tagName.slice(1)),
      text: heading.textContent?.trim() || heading.tagName.toUpperCase()
    }));
    const jumps = findHeadingLevelJumps(headings);

    return jumps.map<AuditIssue>((jump, index) => {
      const heading = headingElements[jump.toIndex];
      const selector = createStableSelector(heading);

      return {
        id: createIssueId("heading-order", selector, index),
        ruleId: "heading-order",
        title: `标题从 H${jump.fromLevel} 跳到 H${jump.toLevel}`,
        severity: "warning",
        description: `页面标题从 H${jump.fromLevel} 直接跳到 H${jump.toLevel}，可能导致内容结构难以理解。`,
        recommendation: "调整标题层级，让页面结构按顺序递进，例如 H2 后使用 H3，而不是直接使用 H4 或更深层级。",
        selector,
        elementTag: getElementTag(heading)
      };
    });
  }
};
