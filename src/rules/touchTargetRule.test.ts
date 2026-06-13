import { beforeEach, describe, expect, it, vi } from "vitest";
import { touchTargetRule } from "./touchTargetRule";

describe("touchTargetRule", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    setViewport(1440, false);
  });

  it("passes 24x24 and 44x44 targets", () => {
    document.body.innerHTML = `
      <button id="minimum">24</button>
      <button id="comfortable">44</button>
    `;
    rect("#minimum", 0, 0, 24, 24);
    rect("#comfortable", 80, 0, 44, 44);

    expect(touchTargetRule.check()).toHaveLength(0);
  });

  it("does not flag a normal 38px tall desktop button", () => {
    document.body.innerHTML = '<button id="desktop">Desktop button</button>';
    rect("#desktop", 0, 0, 216, 38);

    expect(touchTargetRule.check()).toHaveLength(0);
  });

  it("reports small targets when neighboring targets are too close", () => {
    document.body.innerHTML = `
      <button id="a">A</button>
      <button id="b">B</button>
    `;
    rect("#a", 0, 0, 18, 18);
    rect("#b", 20, 0, 18, 18);

    const issues = touchTargetRule.check();
    expect(issues).toHaveLength(2);
    expect(issues[0].severity).toBe("warning");
    expect(issues[0].diagnostics?.reasonCode).toBe("undersized-and-insufficient-spacing");
  });

  it("skips small targets with enough spacing", () => {
    document.body.innerHTML = `
      <button id="a">A</button>
      <button id="b">B</button>
    `;
    rect("#a", 0, 0, 18, 18);
    rect("#b", 70, 0, 18, 18);

    expect(touchTargetRule.check()).toHaveLength(0);
  });

  it("skips inline text links but still detects nearby icon links", () => {
    document.body.innerHTML = `
      <p>Read <a id="inline" style="display:inline" href="#x">details</a> today.</p>
      <a id="icon-a" style="display:inline-flex" href="#a" aria-label="A"><svg></svg></a>
      <a id="icon-b" style="display:inline-flex" href="#b" aria-label="B"><svg></svg></a>
    `;
    rect("#inline", 0, 0, 18, 18);
    rect("#icon-a", 0, 40, 18, 18);
    rect("#icon-b", 20, 40, 18, 18);

    const issues = touchTargetRule.check();
    expect(issues).toHaveLength(2);
    expect(issues.map((issue) => issue.selector)).not.toContain("#inline");
  });

  it("skips disabled and WebLens injected elements", () => {
    document.body.innerHTML = `
      <button id="disabled" disabled>X</button>
      <button id="injected" data-weblens-injected="true">W</button>
    `;
    rect("#disabled", 0, 0, 18, 18);
    rect("#injected", 20, 0, 18, 18);

    expect(touchTargetRule.check()).toHaveLength(0);
  });

  it("creates comfort info only for coarse pointer or narrow viewport", () => {
    document.body.innerHTML = '<button id="target">Tap</button>';
    rect("#target", 0, 0, 38, 38);

    expect(touchTargetRule.check()).toHaveLength(0);

    setViewport(390, true);
    const issues = touchTargetRule.check();
    expect(issues).toHaveLength(1);
    expect(issues[0].severity).toBe("info");
    expect(issues[0].diagnostics?.reasonCode).toBe("touch-comfort-advisory");
  });
});

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

function setViewport(width: number, coarsePointer: boolean): void {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn((query: string) => ({
      matches: query === "(pointer: coarse)" ? coarsePointer : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });
}
