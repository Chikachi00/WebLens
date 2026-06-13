const HIGHLIGHT_CLASS_NAME = "weblens-highlight-target";
const HIGHLIGHT_DURATION_MS = 3000;

let activeElement: Element | null = null;
let activeTimeout: number | null = null;

export function highlightElement(selector: string): boolean {
  clearHighlight();

  const element = document.querySelector(selector);
  if (!element) {
    return false;
  }

  ensureHighlightStyles();
  element.scrollIntoView({ behavior: "smooth", block: "center" });
  element.classList.add(HIGHLIGHT_CLASS_NAME);
  activeElement = element;
  activeTimeout = window.setTimeout(clearHighlight, HIGHLIGHT_DURATION_MS);

  return true;
}

export function clearHighlight(): void {
  if (activeTimeout !== null) {
    window.clearTimeout(activeTimeout);
    activeTimeout = null;
  }

  if (activeElement) {
    activeElement.classList.remove(HIGHLIGHT_CLASS_NAME);
    activeElement = null;
  }
}

function ensureHighlightStyles(): void {
  if (document.getElementById("weblens-highlight-style")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "weblens-highlight-style";
  style.textContent = `
    .${HIGHLIGHT_CLASS_NAME} {
      outline: 3px solid #f97316 !important;
      outline-offset: 3px !important;
      box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.12), 0 0 0 6px rgba(249, 115, 22, 0.24) !important;
      background-color: rgba(249, 115, 22, 0.12) !important;
      transition: outline-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease !important;
    }
  `;
  document.documentElement.append(style);
}
