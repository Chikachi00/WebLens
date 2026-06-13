const STABLE_ATTRIBUTES = ["data-testid", "data-test", "data-cy", "name", "aria-label", "role"];
const RANDOM_CLASS_PATTERN = /(^|[-_])([a-f0-9]{6,}|[a-z]{1,2}\d{4,}|css-\w+|sc-\w+)/i;

export function createStableSelector(element: Element, root: ParentNode = document): string {
  const idSelector = getUniqueIdSelector(element, root);
  if (idSelector) {
    return idSelector;
  }

  const stableAttributeSelector = getUniqueStableAttributeSelector(element, root);
  if (stableAttributeSelector) {
    return stableAttributeSelector;
  }

  const classSelector = getUniqueClassSelector(element, root);
  if (classSelector) {
    return classSelector;
  }

  return buildElementPath(element, root);
}

export function isUniqueSelector(selector: string, root: ParentNode = document): boolean {
  try {
    return root.querySelectorAll(selector).length === 1;
  } catch {
    return false;
  }
}

export function isStableClassName(className: string): boolean {
  return className.length > 1 && !RANDOM_CLASS_PATTERN.test(className);
}

function getUniqueIdSelector(element: Element, root: ParentNode): string | null {
  const id = element.id?.trim();
  if (!id) {
    return null;
  }

  const selector = `#${escapeCss(id)}`;
  return isUniqueSelector(selector, root) ? selector : null;
}

function getUniqueStableAttributeSelector(element: Element, root: ParentNode): string | null {
  const tagName = element.tagName.toLowerCase();

  for (const attribute of STABLE_ATTRIBUTES) {
    const value = element.getAttribute(attribute)?.trim();
    if (!value) {
      continue;
    }

    const selector = `${tagName}[${attribute}="${escapeAttribute(value)}"]`;
    if (isUniqueSelector(selector, root)) {
      return selector;
    }
  }

  return null;
}

function getUniqueClassSelector(element: Element, root: ParentNode): string | null {
  const stableClasses = Array.from(element.classList).filter(isStableClassName).slice(0, 3);
  if (stableClasses.length === 0) {
    return null;
  }

  const tagName = element.tagName.toLowerCase();
  const selector = `${tagName}${stableClasses.map((className) => `.${escapeCss(className)}`).join("")}`;
  return isUniqueSelector(selector, root) ? selector : null;
}

function buildElementPath(element: Element, root: ParentNode): string {
  const segments: string[] = [];
  let current: Element | null = element;

  while (current && current !== document.documentElement) {
    const parent: Element | null = current.parentElement;
    const tagName = current.tagName.toLowerCase();
    let segment = tagName;

    if (parent) {
      const sameTagSiblings = Array.from(parent.children).filter(
        (child) => child.tagName.toLowerCase() === tagName
      );
      if (sameTagSiblings.length > 1) {
        segment += `:nth-of-type(${sameTagSiblings.indexOf(current) + 1})`;
      }
    }

    segments.unshift(segment);
    const selector = segments.join(" > ");
    if (isUniqueSelector(selector, root)) {
      return selector;
    }

    current = parent;
  }

  const fallback = segments.join(" > ");
  return fallback || element.tagName.toLowerCase();
}

function escapeCss(value: string): string {
  if (typeof CSS !== "undefined" && CSS.escape) {
    return CSS.escape(value);
  }

  return value.replace(/([ !"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, "\\$1");
}

function escapeAttribute(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
