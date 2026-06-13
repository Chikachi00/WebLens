import { beforeEach, describe, expect, it, vi } from "vitest";
import { findOverflowCandidates, getPageOverflowMetrics, overflowRule } from "./overflowRule";

describe("overflowRule", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    setViewport(1000);
    setScrollWidth(document.documentElement, 1000);
    setScrollWidth(document.body, 1000);
  });

  it("combines html and body scroll widths", () => {
    setScrollWidth(document.documentElement, 1000);
    setScrollWidth(document.body, 1120);

    const metrics = getPageOverflowMetrics();
    expect(metrics.effectiveContentWidth).toBe(1120);
    expect(metrics.overflowAmount).toBe(120);
  });

  it("ignores 1px subpixel differences", () => {
    setScrollWidth(document.documentElement, 1001);

    expect(overflowRule.check()).toHaveLength(0);
  });

  it("reports clear page overflow with diagnostics", () => {
    document.body.innerHTML = '<div id="wide"></div>';
    setScrollWidth(document.documentElement, 1200);
    rect("#wide", 0, 0, 1200, 60);

    const issues = overflowRule.check();
    expect(issues).toHaveLength(1);
    expect(issues[0].diagnostics?.measured?.overflowAmount).toBe(200);
    expect(issues[0].diagnostics?.reasonCode).toBe("fixed-width");
  });

  it("skips children inside reasonable horizontal scrollers", () => {
    document.body.innerHTML = `
      <div id="scroller" style="overflow-x:auto">
        <div id="table"></div>
      </div>
    `;
    setScrollWidth(document.documentElement, 1200);
    rect("#scroller", 0, 0, 1000, 60);
    rect("#table", 0, 0, 1200, 60);
    setElementWidths("#scroller", 1200, 1000);

    const candidates = findOverflowCandidates(1000);
    expect(candidates.map((candidate) => candidate.element.id)).not.toContain("table");
  });

  it("reports the scroller itself when it overflows the viewport", () => {
    document.body.innerHTML = '<div id="scroller" style="overflow-x:auto"></div>';
    setScrollWidth(document.documentElement, 1150);
    rect("#scroller", 0, 0, 1150, 60);
    setElementWidths("#scroller", 1300, 900);

    expect(findOverflowCandidates(1000).map((candidate) => candidate.element.id)).toContain("scroller");
  });

  it("sorts candidates by overflow, dedupes related elements, and limits results", () => {
    document.body.innerHTML = `
      <div id="parent"><div id="child"></div></div>
      <div id="a"></div>
      <div id="b"></div>
      <div id="c"></div>
      <div id="d"></div>
      <div id="e"></div>
      <div id="f"></div>
    `;
    setScrollWidth(document.documentElement, 1400);
    rect("#parent", 0, 0, 1300, 60);
    rect("#child", 0, 0, 1250, 40);
    rect("#a", 0, 80, 1200, 40);
    rect("#b", 0, 130, 1190, 40);
    rect("#c", 0, 180, 1180, 40);
    rect("#d", 0, 230, 1170, 40);
    rect("#e", 0, 280, 1160, 40);
    rect("#f", 0, 330, 1150, 40);

    const candidates = findOverflowCandidates(1000);
    expect(candidates).toHaveLength(5);
    expect(candidates[0].element.id).toBe("parent");
    expect(candidates.map((candidate) => candidate.element.id)).not.toContain("child");
    expect(candidates[0].totalOverflow).toBeGreaterThan(candidates[1].totalOverflow);
  });

  it("skips WebLens injected elements", () => {
    document.body.innerHTML = '<div id="injected" data-weblens-injected="true"></div>';
    setScrollWidth(document.documentElement, 1200);
    rect("#injected", 0, 0, 1200, 60);

    expect(findOverflowCandidates(1000)).toHaveLength(0);
  });
});

function setViewport(width: number): void {
  Object.defineProperty(document.documentElement, "clientWidth", { configurable: true, value: width });
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  Object.defineProperty(window, "visualViewport", { configurable: true, value: { width } });
}

function setScrollWidth(element: Element, width: number): void {
  Object.defineProperty(element, "scrollWidth", { configurable: true, value: width });
}

function setElementWidths(selector: string, scrollWidth: number, clientWidth: number): void {
  const element = document.querySelector(selector) as HTMLElement;
  Object.defineProperty(element, "scrollWidth", { configurable: true, value: scrollWidth });
  Object.defineProperty(element, "clientWidth", { configurable: true, value: clientWidth });
}

function rect(selector: string, left: number, top: number, width: number, height: number): void {
  const element = document.querySelector(selector) as HTMLElement;
  Object.defineProperty(element, "getBoundingClientRect", {
    configurable: true,
    value: vi.fn(() => ({
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height,
      x: left,
      y: top,
      toJSON: () => ({})
    }))
  });
}
