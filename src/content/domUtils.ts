export function isElementVisible(element: Element): boolean {
  if (!(element instanceof HTMLElement) && !(element instanceof SVGElement)) {
    return false;
  }

  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    return false;
  }

  const style = window.getComputedStyle(element);
  return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
}

export function getElementTag(element: Element): string {
  return element.tagName.toLowerCase();
}

export function hasAccessibleReference(element: Element): boolean {
  const ariaLabel = element.getAttribute("aria-label")?.trim();
  const labelledBy = element.getAttribute("aria-labelledby")?.trim();
  return Boolean(ariaLabel || labelledBy);
}

export function getVisibleText(element: Element): string {
  return (element.textContent ?? "").replace(/\s+/g, " ").trim();
}

export function hasMeaningfulTitle(element: Element): boolean {
  return Boolean(element.getAttribute("title")?.trim());
}

export function hasMeaningfulImageAlt(element: Element): boolean {
  return Array.from(element.querySelectorAll("img")).some((image) => {
    const alt = image.getAttribute("alt");
    return Boolean(alt?.trim());
  });
}

export function createIssueId(ruleId: string, selector: string, index: number): string {
  return `${ruleId}-${index}-${hashString(selector)}`;
}

function hashString(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
}
