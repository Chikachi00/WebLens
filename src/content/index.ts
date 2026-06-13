import { getPageInfo, runAudit } from "./auditEngine";
import { clearHighlight, highlightElement } from "./highlight";
import type { ExtensionMessage, ExtensionResponse } from "../shared/types";

chrome.runtime.onMessage.addListener(
  (message: ExtensionMessage, _sender, sendResponse: (response: ExtensionResponse) => void) => {
    if (message.type === "RUN_AUDIT") {
      clearHighlight();
      sendResponse({ ok: true, payload: runAudit() });
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

    if (message.type === "CLEAR_HIGHLIGHT") {
      clearHighlight();
      sendResponse({ ok: true });
      return false;
    }

    return false;
  }
);
