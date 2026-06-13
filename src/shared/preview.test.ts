import { describe, expect, it } from "vitest";
import { validatePreviewFix } from "./preview";

describe("validatePreviewFix", () => {
  it("accepts legal style, attribute, and composite fixes", () => {
    expect(validatePreviewFix("button", { type: "style", styles: { "min-width": "44px" } }).valid).toBe(true);
    expect(validatePreviewFix("img", { type: "attribute", attribute: "alt", value: "图片描述" }).valid).toBe(true);
    expect(
      validatePreviewFix("button", {
        type: "composite",
        operations: [
          { type: "style", styles: { "min-height": "44px" } },
          { type: "attribute", attribute: "aria-label", value: "按钮说明" }
        ]
      }).valid
    ).toBe(true);
  });

  it("rejects empty selectors, illegal properties, unsupported types, and dangerous values", () => {
    expect(validatePreviewFix("", { type: "style", styles: { "min-width": "44px" } }).valid).toBe(false);
    expect(validatePreviewFix("button", { type: "style", styles: { color: "red" } }).valid).toBe(false);
    expect(validatePreviewFix("button", { type: "attribute", attribute: "onclick", value: "alert(1)" }).valid).toBe(false);
    expect(validatePreviewFix("a", { type: "attribute", attribute: "href", value: "https://example.com" }).valid).toBe(false);
    expect(validatePreviewFix("img", { type: "attribute", attribute: "alt", value: "<script>" }).valid).toBe(false);
    expect(validatePreviewFix("button", { type: "other" } as never).valid).toBe(false);
  });
});
