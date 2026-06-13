const IGNORED_INPUT_TYPES = new Set(["hidden", "submit", "button", "reset"]);

export function isLabelableFormControl(element: Element): element is HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement {
  if (element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
    return true;
  }

  if (!(element instanceof HTMLInputElement)) {
    return false;
  }

  return !IGNORED_INPUT_TYPES.has(element.type.toLowerCase());
}

export function hasProgrammaticLabel(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  root: ParentNode = document
): boolean {
  const id = element.id.trim();
  if (id) {
    const escapedId = id.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    if (root.querySelector(`label[for="${escapedId}"]`)) {
      return true;
    }
  }

  if (element.closest("label")) {
    return true;
  }

  return Boolean(element.getAttribute("aria-label")?.trim() || element.getAttribute("aria-labelledby")?.trim());
}
