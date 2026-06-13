import { beforeEach, describe, expect, it } from "vitest";
import { hasProgrammaticLabel, isLabelableFormControl } from "./formLabels";

describe("form label helpers", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("ignores hidden and button-like inputs", () => {
    document.body.innerHTML = '<input type="hidden"><input type="submit"><input type="email">';
    const inputs = Array.from(document.querySelectorAll("input"));

    expect(inputs.map(isLabelableFormControl)).toEqual([false, false, true]);
  });

  it("detects label for associations", () => {
    document.body.innerHTML = '<label for="email">邮箱</label><input id="email" type="email">';
    const input = document.querySelector("input") as HTMLInputElement;

    expect(hasProgrammaticLabel(input)).toBe(true);
  });

  it("detects wrapped labels and aria labels", () => {
    document.body.innerHTML = `
      <label>昵称<input id="nickname"></label>
      <textarea aria-label="留言"></textarea>
    `;
    const input = document.querySelector("input") as HTMLInputElement;
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;

    expect(hasProgrammaticLabel(input)).toBe(true);
    expect(hasProgrammaticLabel(textarea)).toBe(true);
  });

  it("reports controls without accessible labels", () => {
    document.body.innerHTML = '<select><option>One</option></select>';
    const select = document.querySelector("select") as HTMLSelectElement;

    expect(hasProgrammaticLabel(select)).toBe(false);
  });
});
