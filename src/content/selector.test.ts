import { beforeEach, describe, expect, it } from "vitest";
import { createStableSelector, isStableClassName } from "./selector";

describe("createStableSelector", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("prefers a unique id", () => {
    document.body.innerHTML = '<button id="submit-order" class="btn primary">Pay</button>';
    const element = document.querySelector("button") as HTMLButtonElement;

    expect(createStableSelector(element)).toBe("#submit-order");
  });

  it("uses stable attributes when id is unavailable", () => {
    document.body.innerHTML = '<button data-testid="close-menu">Close</button>';
    const element = document.querySelector("button") as HTMLButtonElement;

    expect(createStableSelector(element)).toBe('button[data-testid="close-menu"]');
  });

  it("falls back to nth-of-type paths", () => {
    document.body.innerHTML = "<main><button>One</button><button>Two</button></main>";
    const element = document.querySelectorAll("button")[1];

    expect(createStableSelector(element)).toBe("button:nth-of-type(2)");
  });

  it("filters likely generated class names", () => {
    expect(isStableClassName("css-a1b2c3")).toBe(false);
    expect(isStableClassName("primary-action")).toBe(true);
  });
});
