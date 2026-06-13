import type {
  ActivePreview,
  AuditReport,
  ExtensionMessage,
  ExtensionResponse,
  PageInfo,
  PreviewActionResult,
  PreviewFix,
  RunAuditPayload
} from "../shared/types";

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
  return sendMessageToTab(tabId, message);
}

export async function sendMessageToTab(tabId: number, message: ExtensionMessage): Promise<ExtensionResponse> {
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

export async function applyFixPreview(issueId: string, ruleId: string, selector: string, fix: PreviewFix): Promise<PreviewActionResult> {
  const response = await sendMessageToActiveTab({
    type: "APPLY_FIX_PREVIEW",
    payload: { issueId, ruleId, selector, fix }
  });
  if (!response.ok) {
    throw new Error(response.error);
  }

  return response.payload as PreviewActionResult;
}

export async function revertFixPreview(issueId: string): Promise<PreviewActionResult> {
  const response = await sendMessageToActiveTab({ type: "REVERT_FIX_PREVIEW", payload: { issueId } });
  if (!response.ok) {
    throw new Error(response.error);
  }

  return response.payload as PreviewActionResult;
}

export async function revertAllFixPreviews(): Promise<PreviewActionResult> {
  const response = await sendMessageToActiveTab({ type: "REVERT_ALL_FIX_PREVIEWS" });
  if (!response.ok) {
    throw new Error(response.error);
  }

  return response.payload as PreviewActionResult;
}

export async function revertAllFixPreviewsInTab(tabId: number): Promise<PreviewActionResult> {
  const response = await sendMessageToTab(tabId, { type: "REVERT_ALL_FIX_PREVIEWS" });
  if (!response.ok) {
    throw new Error(response.error);
  }

  return response.payload as PreviewActionResult;
}

export async function getActiveFixPreviews(): Promise<ActivePreview[]> {
  const response = await sendMessageToActiveTab({ type: "GET_ACTIVE_FIX_PREVIEWS" });
  if (!response.ok) {
    throw new Error(response.error);
  }

  return response.payload as ActivePreview[];
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname || "本地页面";
  } catch {
    return "受限制页面";
  }
}
