import { act } from "react";
import { createRoot } from "react-dom/client";
import { describe, expect, it, vi } from "vitest";
import { IssueCard } from "./IssueCard";
import type { AuditIssue } from "../../shared/types";

const previewIssue: AuditIssue = {
  id: "issue-preview",
  ruleId: "touch-target",
  title: "点击区域可能过小",
  severity: "info",
  description: "尺寸过小",
  recommendation: "增加最小尺寸",
  selector: "button",
  elementTag: "button",
  supportsPreview: true,
  previewFix: { type: "style", styles: { "min-width": "44px" } },
  previewBefore: ["当前尺寸：28 x 24 px"],
  previewAfter: ["预览尺寸：至少 44 x 44 px"]
};

describe("IssueCard preview UI", () => {
  it("shows preview controls for supported issues and active state after preview", async () => {
    const container = document.createElement("div");
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <IssueCard
          issue={previewIssue}
          onLocate={vi.fn()}
          onCopy={vi.fn()}
          onIgnore={vi.fn()}
          onApplyPreview={vi.fn()}
          onRevertPreview={vi.fn()}
          isPreviewActive={false}
          isPreviewPending={false}
        />
      );
    });

    await act(async () => {
      container.querySelectorAll("button")[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(container.textContent).toContain("预览修复");
    expect(container.textContent).toContain("修改前");

    await act(async () => {
      root.render(
        <IssueCard
          issue={previewIssue}
          onLocate={vi.fn()}
          onCopy={vi.fn()}
          onIgnore={vi.fn()}
          onApplyPreview={vi.fn()}
          onRevertPreview={vi.fn()}
          isPreviewActive
          isPreviewPending={false}
        />
      );
    });
    expect(container.textContent).toContain("正在预览");
  });

  it("does not show preview controls for unsupported issues", async () => {
    const container = document.createElement("div");
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <IssueCard
          issue={{ ...previewIssue, supportsPreview: false, previewFix: undefined }}
          onLocate={vi.fn()}
          onCopy={vi.fn()}
          onIgnore={vi.fn()}
          onApplyPreview={vi.fn()}
          onRevertPreview={vi.fn()}
          isPreviewActive={false}
          isPreviewPending={false}
        />
      );
    });
    await act(async () => {
      container.querySelectorAll("button")[1].dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).not.toContain("预览修复");
    expect(container.textContent).toContain("暂不支持安全的自动预览");
  });
});
