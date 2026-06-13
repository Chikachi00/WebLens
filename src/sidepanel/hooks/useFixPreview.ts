import { useCallback, useState } from "react";
import { applyFixPreview, getActiveFixPreviews, revertAllFixPreviews, revertFixPreview } from "../chromeApi";
import type { ActivePreview, AuditIssue, PreviewFix } from "../../shared/types";

export function useFixPreview(onError: (message: string) => void, onSuccess: (message: string) => void) {
  const [activePreviews, setActivePreviews] = useState<ActivePreview[]>([]);
  const [pendingIssueId, setPendingIssueId] = useState<string | null>(null);

  const refreshPreviews = useCallback(async () => {
    try {
      setActivePreviews(await getActiveFixPreviews());
    } catch {
      setActivePreviews([]);
    }
  }, []);

  const applyPreview = useCallback(
    async (issue: AuditIssue, fix: PreviewFix) => {
      setPendingIssueId(issue.id);
      try {
        const result = await applyFixPreview(issue.id, issue.ruleId, issue.selector, fix);
        await refreshPreviews();
        if (result.success) {
          onSuccess(result.message || "已应用临时修复预览。");
        } else {
          onError(result.message || "应用预览失败。");
        }
      } catch (error) {
        onError(error instanceof Error ? error.message : "应用预览失败。");
      } finally {
        setPendingIssueId(null);
      }
    },
    [onError, onSuccess, refreshPreviews]
  );

  const revertPreview = useCallback(
    async (issueId: string) => {
      setPendingIssueId(issueId);
      try {
        const result = await revertFixPreview(issueId);
        await refreshPreviews();
        if (result.success) {
          onSuccess(result.message || "已撤销预览。");
        } else {
          onError(result.message || "撤销预览失败。");
        }
      } catch (error) {
        onError(error instanceof Error ? error.message : "撤销预览失败。");
      } finally {
        setPendingIssueId(null);
      }
    },
    [onError, onSuccess, refreshPreviews]
  );

  const revertAllPreviews = useCallback(async () => {
    try {
      const result = await revertAllFixPreviews();
      setActivePreviews([]);
      if (result.success) {
        onSuccess(result.message || "已撤销全部预览。");
      } else {
        onError(result.message || "撤销全部预览失败。");
      }
    } catch (error) {
      setActivePreviews([]);
      onError(error instanceof Error ? error.message : "撤销全部预览失败。");
    }
  }, [onError, onSuccess]);

  const clearPreviewState = useCallback(() => setActivePreviews([]), []);
  const isPreviewActive = useCallback((issueId: string) => activePreviews.some((preview) => preview.issueId === issueId), [activePreviews]);

  return {
    activePreviews,
    pendingIssueId,
    applyPreview,
    revertPreview,
    revertAllPreviews,
    refreshPreviews,
    clearPreviewState,
    isPreviewActive
  };
}
