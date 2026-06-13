import { beforeEach, describe, expect, it } from "vitest";
import { applyFixPreview, getActiveFixPreviews, revertAllFixPreviews, revertFixPreview } from "./previewManager";

describe("previewManager", () => {
  beforeEach(() => {
    revertAllFixPreviews();
    document.body.innerHTML = "";
  });

  it("applies and restores missing style properties", () => {
    document.body.innerHTML = '<button id="target">A</button>';

    applyFixPreview("a", "touch-target", "#target", { type: "style", styles: { "min-width": "44px", "min-height": "44px" } });
    const button = document.querySelector("#target") as HTMLElement;
    expect(button.style.minWidth).toBe("44px");
    expect(button.style.minHeight).toBe("44px");

    revertFixPreview("a");
    expect(button.style.getPropertyValue("min-width")).toBe("");
    expect(button.style.getPropertyValue("min-height")).toBe("");
  });

  it("restores existing style values and important priority", () => {
    document.body.innerHTML = '<button id="target" style="min-width: 30px !important; background: red;">A</button>';
    const button = document.querySelector("#target") as HTMLElement;

    applyFixPreview("a", "touch-target", "#target", { type: "style", styles: { "min-width": "44px" } });
    expect(button.style.getPropertyValue("min-width")).toBe("44px");

    revertFixPreview("a");
    expect(button.style.getPropertyValue("min-width")).toBe("30px");
    expect(button.style.getPropertyPriority("min-width")).toBe("important");
    expect(button.style.background).toBe("red");
  });

  it("applies and restores attributes that were missing, empty, or existing", () => {
    document.body.innerHTML = '<img id="missing"><button id="empty" aria-label=""></button><a id="existing" aria-label="Old"></a>';

    applyFixPreview("a", "image-alt", "#missing", { type: "attribute", attribute: "alt", value: "图片描述" });
    applyFixPreview("b", "button-name", "#empty", { type: "attribute", attribute: "aria-label", value: "按钮说明" });
    applyFixPreview("c", "link-name", "#existing", { type: "attribute", attribute: "aria-label", value: "链接说明" });

    revertFixPreview("a");
    revertFixPreview("b");
    revertFixPreview("c");

    expect(document.querySelector("#missing")?.hasAttribute("alt")).toBe(false);
    expect(document.querySelector("#empty")?.getAttribute("aria-label")).toBe("");
    expect(document.querySelector("#existing")?.getAttribute("aria-label")).toBe("Old");
  });

  it("keeps independent previews on the same element from breaking each other", () => {
    document.body.innerHTML = '<button id="target"></button>';
    const button = document.querySelector("#target") as HTMLElement;

    applyFixPreview("style", "touch-target", "#target", { type: "style", styles: { "min-width": "44px" } });
    applyFixPreview("attr", "button-name", "#target", { type: "attribute", attribute: "aria-label", value: "按钮说明" });
    revertFixPreview("style");

    expect(button.style.getPropertyValue("min-width")).toBe("");
    expect(button.getAttribute("aria-label")).toBe("按钮说明");
  });

  it("handles conflicts on the same style property in stack order", () => {
    document.body.innerHTML = '<button id="target" style="min-width: 30px;"></button>';
    const button = document.querySelector("#target") as HTMLElement;

    applyFixPreview("old", "touch-target", "#target", { type: "style", styles: { "min-width": "44px" } });
    applyFixPreview("new", "touch-target", "#target", { type: "style", styles: { "min-width": "48px" } });
    revertFixPreview("old");
    expect(button.style.getPropertyValue("min-width")).toBe("48px");

    revertFixPreview("new");
    expect(button.style.getPropertyValue("min-width")).toBe("30px");
  });

  it("handles conflicts when the newest preview is reverted first", () => {
    document.body.innerHTML = '<button id="target" style="min-width: 30px;"></button>';
    const button = document.querySelector("#target") as HTMLElement;

    applyFixPreview("old", "touch-target", "#target", { type: "style", styles: { "min-width": "44px" } });
    applyFixPreview("new", "touch-target", "#target", { type: "style", styles: { "min-width": "48px" } });
    revertFixPreview("new");
    expect(button.style.getPropertyValue("min-width")).toBe("44px");

    revertAllFixPreviews();
    expect(button.style.getPropertyValue("min-width")).toBe("30px");
  });

  it("does not apply the same issue twice", () => {
    document.body.innerHTML = '<button id="target"></button>';

    applyFixPreview("same", "touch-target", "#target", { type: "style", styles: { "min-width": "44px" } });
    const result = applyFixPreview("same", "touch-target", "#target", { type: "style", styles: { "min-width": "48px" } });

    expect(result.success).toBe(true);
    expect(getActiveFixPreviews()).toHaveLength(1);
  });

  it("returns friendly failure for missing selectors", () => {
    const result = applyFixPreview("missing", "touch-target", "#missing", { type: "style", styles: { "min-width": "44px" } });

    expect(result.success).toBe(false);
    expect(result.message).toContain("原预览元素不存在");
  });
});
