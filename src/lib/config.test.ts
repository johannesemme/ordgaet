import { describe, expect, it } from "vitest";
import { ALPHABET, MAX_GUESSES, WORD_LENGTH } from "./config";

describe("game constants", () => {
  it("uses five-letter words", () => {
    expect(WORD_LENGTH).toBe(5);
  });

  it("allows eight attempts", () => {
    expect(MAX_GUESSES).toBe(8);
  });

  it("has all 29 Danish letters, each exactly once", () => {
    expect(ALPHABET).toHaveLength(29);
    expect(new Set(ALPHABET).size).toBe(29);
  });

  it("includes Æ, Ø and Å as single characters", () => {
    for (const letter of ["Æ", "Ø", "Å"]) {
      expect(ALPHABET).toContain(letter);
      expect(letter).toHaveLength(1);
    }
  });
});
