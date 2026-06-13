import { describe, expect, it } from "vitest";
import { findHeadingLevelJumps } from "./headingOrder";

describe("findHeadingLevelJumps", () => {
  it("detects heading jumps to deeper levels", () => {
    const jumps = findHeadingLevelJumps([
      { level: 1, text: "Intro" },
      { level: 4, text: "Details" }
    ]);

    expect(jumps).toEqual([
      {
        fromLevel: 1,
        toLevel: 4,
        fromText: "Intro",
        toText: "Details",
        toIndex: 1
      }
    ]);
  });

  it("allows returning to a higher heading level", () => {
    const jumps = findHeadingLevelJumps([
      { level: 3, text: "Deep" },
      { level: 2, text: "Parent" }
    ]);

    expect(jumps).toEqual([]);
  });
});
