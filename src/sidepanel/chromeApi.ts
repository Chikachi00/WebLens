import type { AuditReport, ExtensionMessage, ExtensionResponse, PageInfo } from "../shared/types";

export async function getActiveTabId(): Promise<number> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error("无法获取当前标签页。");
  }

  return tab.id;
}

export async function sendMessageToActiveTab(message: ExtensionMessage): Promise<ExtensionResponse> {
  const tabId = await getActiveTabId();
  return chrome.tabs.sendMessage(tabId, message);
}

export async function requestPageInfo(): Promise<PageInfo> {
  const response = await sendMessageToActiveTab({ type: "GET_PAGE_INFO" });
  if (!response.ok) {
    throw new Error(response.error);
  }

  return response.payload as PageInfo;
}

export async function requestAuditReport(): Promise<AuditReport> {
  const response = await sendMessageToActiveTab({ type: "RUN_AUDIT" });
  if (!response.ok) {
    throw new Error(response.error);
  }

  return response.payload as AuditReport;
}

export async function requestElementHighlight(selector: string): Promise<void> {
  const response = await sendMessageToActiveTab({ type: "HIGHLIGHT_ELEMENT", selector });
  if (!response.ok) {
    throw new Error(response.error);
  }
}
