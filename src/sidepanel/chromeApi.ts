import type { AuditReport, ExtensionMessage, ExtensionResponse, PageInfo, RunAuditPayload } from "../shared/types";

export interface ActiveTabInfo {
  id: number;
  title: string;
  url: string;
  domain: string;
}

export async function getActiveTab(): Promise<ActiveTabInfo> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) {
    throw new Error("无法获取当前标签页。");
  }

  return {
    id: tab.id,
    title: tab.title || "未命名页面",
    url: tab.url || "",
    domain: getDomain(tab.url || "")
  };
}

export async function getActiveTabId(): Promise<number> {
  return (await getActiveTab()).id;
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

export async function requestAuditReport(payload: RunAuditPayload): Promise<AuditReport> {
  const response = await sendMessageToActiveTab({ type: "RUN_AUDIT", payload });
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

function getDomain(url: string): string {
  try {
    return new URL(url).hostname || "本地页面";
  } catch {
    return "受限制页面";
  }
}
