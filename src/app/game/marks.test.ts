import { describe, expect, it } from "vitest";
import { MARK_CYCLE, markKey, markLabel, nextMark, type Mark } from "./marks";

describe("nextMark", () => {
  it("cycles none -> green -> yellow -> red -> none", () => {
    expect(nextMark(null)).toBe("green");
    expect(nextMark("green")).toBe("yellow");
    expect(nextMark("yellow")).toBe("red");
    expect(nextMark("red")).toBe(null);
  });

  it("returns to the starting mark after one full cycle", () => {
    let mark: Mark = null;
    for (let i = 0; i < MARK_CYCLE.length; i++) mark = nextMark(mark);
    expect(mark).toBe(null);
  });

  it("treats an undefined mark as none", () => {
    // Cells that have never been clicked have no entry in the marks object.
    expect(nextMark(undefined as unknown as Mark)).toBe("green");
  });
});

describe("markKey", () => {
  it("identifies a cell by row and position", () => {
    expect(markKey(0, 0)).toBe("0:0");
    expect(markKey(7, 4)).toBe("7:4");
  });

  it("gives every cell in the grid a distinct key", () => {
    const keys = new Set<string>();
    for (let row = 0; row < 8; row++)
      for (let cell = 0; cell < 5; cell++) keys.add(markKey(row, cell));
    expect(keys.size).toBe(40);
  });
});

describe("markLabel", () => {
  it("describes every mark in Danish", () => {
    expect(markLabel(null)).toBe("ikke markeret");
    expect(markLabel("green")).toBe("markeret grøn");
    expect(markLabel("yellow")).toBe("markeret gul");
    expect(markLabel("red")).toBe("markeret rød");
  });
});
