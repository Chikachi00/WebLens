import { expect, test } from "@playwright/test";

const fixturesRoot = new URL("../../fixtures/", import.meta.url);

function fixtureUrl(name: string): string {
  return new URL(name, fixturesRoot).toString();
}

test("clean fixture has no expected V0.4 issues", async ({ page }) => {
  await page.goto(fixtureUrl("clean.html"));

  const result = await page.evaluate(() => ({
    missingAlt: document.querySelectorAll("img:not([alt])").length,
    htmlLang: document.documentElement.getAttribute("lang"),
    overflowAmount: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - document.documentElement.clientWidth,
    unlabeledControls: Array.from(document.querySelectorAll("input, textarea, select")).filter((control) => {
      const id = control.getAttribute("id");
      return !control.closest("label") && !control.getAttribute("aria-label") && !control.getAttribute("aria-labelledby") && !(id && document.querySelector(`label[for="${id}"]`));
    }).length,
    unnamedButtons: Array.from(document.querySelectorAll("button, [role='button']")).filter((button) => {
      return !(button.textContent ?? "").trim() && !button.getAttribute("aria-label") && !button.getAttribute("aria-labelledby") && !button.getAttribute("title");
    }).length
  }));

  expect(result.missingAlt).toBe(0);
  expect(result.htmlLang).toBe("zh-CN");
  expect(result.overflowAmount).toBeLessThanOrEqual(2);
  expect(result.unlabeledControls).toBe(0);
  expect(result.unnamedButtons).toBe(0);
});

test("touch target fixture exposes expected geometry cases", async ({ page }) => {
  await page.goto(fixtureUrl("touch-targets.html"));

  const result = await page.evaluate(() => {
    const box = (testId: string) => {
      const rect = document.querySelector(`[data-testid="${testId}"]`)!.getBoundingClientRect();
      return { width: Math.round(rect.width), height: Math.round(rect.height), left: Math.round(rect.left), right: Math.round(rect.right) };
    };
    const tightA = document.querySelector('[data-testid="tiny-tight-a"]')!.getBoundingClientRect();
    const tightB = document.querySelector('[data-testid="tiny-tight-b"]')!.getBoundingClientRect();
    const spacedA = document.querySelector('[data-testid="tiny-spaced-a"]')!.getBoundingClientRect();
    const spacedB = document.querySelector('[data-testid="tiny-spaced-b"]')!.getBoundingClientRect();
    const centerDistance = (a: DOMRect, b: DOMRect) =>
      Math.hypot(a.left + a.width / 2 - (b.left + b.width / 2), a.top + a.height / 2 - (b.top + b.height / 2));

    return {
      target24: box("target-24"),
      target44: box("target-44"),
      desktop38: box("desktop-38"),
      tightGap: Math.round(centerDistance(tightA, tightB) - 24),
      spacedGap: Math.round(centerDistance(spacedA, spacedB) - 24),
      inlineDisplay: getComputedStyle(document.querySelector('[data-testid="inline-link"]')!).display,
      iconDisplay: getComputedStyle(document.querySelector('[data-testid="icon-link"]')!).display,
      disabled: (document.querySelector('[data-testid="disabled-small"]') as HTMLButtonElement).disabled,
      injected: document.querySelector('[data-testid="injected-small"]')?.getAttribute("data-weblens-injected")
    };
  });

  expect(result.target24).toMatchObject({ width: 24, height: 24 });
  expect(result.target44).toMatchObject({ width: 44, height: 44 });
  expect(result.desktop38.height).toBe(38);
  expect(result.tightGap).toBeLessThan(0);
  expect(result.spacedGap).toBeGreaterThan(0);
  expect(result.inlineDisplay).toBe("inline");
  expect(result.iconDisplay).toBe("inline-flex");
  expect(result.disabled).toBe(true);
  expect(result.injected).toBe("true");
});

test("overflow fixture identifies page overflow and reasonable local scrollers", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 800 });
  await page.goto(fixtureUrl("overflow.html"));

  const result = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    const effectiveContentWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
    const wideFixed = document.querySelector('[data-testid="wide-fixed"]')!.getBoundingClientRect();
    const tableScroll = document.querySelector('[data-testid="table-scroll"]') as HTMLElement;
    const wideTable = document.querySelector('[data-testid="wide-table"]')!.getBoundingClientRect();

    return {
      viewportWidth,
      effectiveContentWidth,
      overflowAmount: effectiveContentWidth - viewportWidth,
      wideFixedOverflow: Math.round(wideFixed.right - viewportWidth),
      tableScrollOverflowsInternally: tableScroll.scrollWidth > tableScroll.clientWidth,
      tableContainerRightOverflow: Math.round(tableScroll.getBoundingClientRect().right - viewportWidth),
      wideTableWidth: Math.round(wideTable.width)
    };
  });

  expect(result.overflowAmount).toBeGreaterThan(100);
  expect(result.wideFixedOverflow).toBeGreaterThan(100);
  expect(result.tableScrollOverflowsInternally).toBe(true);
  expect(result.tableContainerRightOverflow).toBeLessThanOrEqual(2);
  expect(result.wideTableWidth).toBeGreaterThan(1000);
});

test("temporary preview changes can be applied and restored precisely", async ({ page }) => {
  await page.goto(fixtureUrl("touch-targets.html"));

  const result = await page.evaluate(() => {
    const button = document.querySelector('[data-testid="desktop-38"]') as HTMLElement;
    button.style.setProperty("min-width", "30px", "important");
    button.style.backgroundColor = "red";
    const original = {
      minWidth: button.style.getPropertyValue("min-width"),
      priority: button.style.getPropertyPriority("min-width"),
      background: button.style.backgroundColor
    };

    button.style.setProperty("min-width", "44px");
    button.style.setProperty("min-height", "44px");

    const applied = {
      minWidth: button.style.getPropertyValue("min-width"),
      minHeight: button.style.getPropertyValue("min-height")
    };

    button.style.setProperty("min-width", original.minWidth, original.priority);
    button.style.removeProperty("min-height");
    button.style.backgroundColor = original.background;

    return {
      applied,
      restored: {
        minWidth: button.style.getPropertyValue("min-width"),
        priority: button.style.getPropertyPriority("min-width"),
        minHeight: button.style.getPropertyValue("min-height"),
        background: button.style.backgroundColor
      }
    };
  });

  expect(result.applied).toEqual({ minWidth: "44px", minHeight: "44px" });
  expect(result.restored).toEqual({ minWidth: "30px", priority: "important", minHeight: "", background: "red" });
});
