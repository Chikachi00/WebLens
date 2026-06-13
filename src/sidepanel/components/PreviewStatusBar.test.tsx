import { createRoot } from "react-dom/client";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { PreviewStatusBar } from "./PreviewStatusBar";

describe("PreviewStatusBar", () => {
  it("hides when there are no active previews and shows the count otherwise", () => {
    const container = document.createElement("div");
    const root = createRoot(container);
    act(() => {
      root.render(<PreviewStatusBar count={0} onRevertAll={vi.fn()} />);
    });
    expect(container.textContent).toBe("");

    act(() => {
      root.render(<PreviewStatusBar count={3} onRevertAll={vi.fn()} />);
    });
    expect(container.textContent).toContain("正在预览 3 项临时修复");
  });
});
