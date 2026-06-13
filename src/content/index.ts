import { getPageInfo, runAudit } from "./auditEngine";
import { clearHighlight, highlightElement } from "./highlight";
import { applyFixPreview, getActiveFixPreviews, revertAllFixPreviews, revertFixPreview } from "./previewManager";
import type { ExtensionMessage, ExtensionResponse } from "../shared/types";

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse: (response: ExtensionResponse) => void) => {
    if (message.type === "RUN_AUDIT") {
      clearHighlight();
      revertAllFixPreviews();
      sendResponse({ ok: true, payload: runAudit(message.payload) });
      return false;
    }

    if (message.type === "GET_PAGE_INFO") {
      sendResponse({ ok: true, payload: getPageInfo() });
      return false;
    }

    if (message.type === "HIGHLIGHT_ELEMENT") {
      const highlighted = highlightElement(message.selector);
      if (highlighted) {
        sendResponse({ ok: true, payload: { highlighted: true } });
      } else {
        sendResponse({ ok: false, error: "元素已经不存在，无法定位。" });
      }
      return false;
    }

    if (message.type === "APPLY_FIX_PREVIEW") {
      const { issueId, ruleId, selector, fix } = message.payload;
      sendResponse({ ok: true, payload: applyFixPreview(issueId, ruleId, selector, fix) });
      return false;
    }

    if (message.type === "REVERT_FIX_PREVIEW") {
      sendResponse({ ok: true, payload: revertFixPreview(message.payload.issueId) });
      return false;
    }

    if (message.type === "REVERT_ALL_FIX_PREVIEWS") {
      sendResponse({ ok: true, payload: revertAllFixPreviews() });
      return false;
    }

    if (message.type === "GET_ACTIVE_FIX_PREVIEWS") {
      sendResponse({ ok: true, payload: getActiveFixPreviews() });
      return false;
    }

    if (message.type === "CLEAR_HIGHLIGHT") {
      clearHighlight();
      sendResponse({ ok: true });
      return false;
    }

    return false;
  }
);
