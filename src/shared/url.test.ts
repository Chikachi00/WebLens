import { describe, expect, it } from "vitest";
import { getSiteTarget, normalizePageUrl } from "./url";

describe("url helpers", () => {
  it("removes query string and hash", () => {
    expect(normalizePageUrl("https://example.com/products?id=12#reviews")).toBe("https://example.com/products");
  });

  it("normalizes trailing slashes except origin root", () => {
    expect(normalizePageUrl("https://example.com/products/")).toBe("https://example.com/products");
    expect(normalizePageUrl("https://example.com/")).toBe("https://example.com/");
  });

  it("keeps different pathnames and hostnames distinct", () => {
    expect(normalizePageUrl("https://example.com/a")).not.toBe(normalizePageUrl("https://example.com/b"));
    expect(getSiteTarget("https://docs.example.com/a")).toBe("docs.example.com");
  });

  it("handles invalid URLs", () => {
    expect(normalizePageUrl("not a url")).toBe("");
    expect(getSiteTarget("not a url")).toBe("");
  });
});
