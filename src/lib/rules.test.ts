import { describe, expect, it } from "vitest";
import { MAX_GUESSES } from "./config";
import { nextStatus, normaliseGuess } from "./rules";

describe("normaliseGuess", () => {
  it("uppercases", () => {
    expect(normaliseGuess("grønt")).toBe("GRØNT");
  });

  it("trims surrounding whitespace", () => {
    expect(normaliseGuess("  grønt\n")).toBe("GRØNT");
  });

  it("keeps Æ, Ø and Å as single characters", () => {
    expect([...normaliseGuess("hævet")]).toHaveLength(5);
    expect(normaliseGuess("åbent")).toBe("ÅBENT");
  });
});

describe("nextStatus", () => {
  it("is active while there are guesses left and none was correct", () => {
    expect(nextStatus(3, 1)).toBe("active");
    expect(nextStatus(0, MAX_GUESSES - 1)).toBe("active");
  });

  it("is won when all five letters are in place", () => {
    expect(nextStatus(5, 1)).toBe("won");
  });

  it("is lost when the last attempt is used without a win", () => {
    expect(nextStatus(4, MAX_GUESSES)).toBe("lost");
  });

  it("counts a correct final guess as a win, not a loss", () => {
    // Winning on the eighth attempt must beat running out of attempts.
    expect(nextStatus(5, MAX_GUESSES)).toBe("won");
  });
});
