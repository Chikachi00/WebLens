const PREVIEW_CLASS_NAME = "weblens-preview-target";
const PREVIEW_LABEL_CLASS_NAME = "weblens-preview-label";
const PREVIEW_STYLE_ID = "weblens-preview-style";

const labels = new Map<string, HTMLElement>();

export function showPreviewOverlay(issueId: string, element: Element): void {
  ensurePreviewStyles();
  element.classList.add(PREVIEW_CLASS_NAME);

  const label = document.createElement("div");
  label.className = PREVIEW_LABEL_CLASS_NAME;
  label.dataset.weblensInjected = "true";
  label.textContent = "WebLens Preview";
  document.body.append(label);
  labels.set(issueId, label);
  positionLabel(label, element);
}

export function removePreviewOverlay(issueId: string, element?: Element, hasOtherPreviews = false): void {
  labels.get(issueId)?.remove();
  labels.delete(issueId);

  if (element && !hasOtherPreviews) {
    element.classList.remove(PREVIEW_CLASS_NAME);
  }
}

export function removeAllPreviewOverlays(): void {
  for (const label of labels.values()) {
    label.remove();
  }
  labels.clear();
  for (const element of document.querySelectorAll(`.${PREVIEW_CLASS_NAME}`)) {
    element.classList.remove(PREVIEW_CLASS_NAME);
  }
}

function ensurePreviewStyles(): void {
  if (document.getElementById(PREVIEW_STYLE_ID)) {
    return;
  }

  const style = document.createElement("style");
  style.id = PREVIEW_STYLE_ID;
  style.dataset.weblensInjected = "true";
  style.textContent = `
    .${PREVIEW_CLASS_NAME} {
      outline: 3px solid #2563eb !important;
      outline-offset: 3px !important;
      box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.22) !important;
    }
    .${PREVIEW_LABEL_CLASS_NAME} {
      position: absolute !important;
      z-index: 2147483647 !important;
      padding: 3px 7px !important;
      border-radius: 4px !important;
      background: #2563eb !important;
      color: white !important;
      font: 12px/1.4 Arial, sans-serif !important;
      pointer-events: none !important;
    }
  `;
  document.documentElement.append(style);
}

function positionLabel(label: HTMLElement, element: Element): void {
  const rect = element.getBoundingClientRect();
  label.style.left = `${Math.max(8, rect.left + window.scrollX)}px`;
  label.style.top = `${Math.max(8, rect.top + window.scrollY - 28)}px`;
}
