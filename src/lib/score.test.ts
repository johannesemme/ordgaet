import { describe, expect, it } from "vitest";
import { ALPHABET, WORD_LENGTH } from "./config";
import { hasRepeatedLetters, score } from "./score";

describe("hasRepeatedLetters", () => {
  it("is false for a word of distinct letters", () => {
    expect(hasRepeatedLetters("GRØNT")).toBe(false);
  });

  it("is true when a letter appears twice", () => {
    expect(hasRepeatedLetters("SLAGS")).toBe(true);
  });

  it("treats Æ, Ø and Å as ordinary single letters", () => {
    expect(hasRepeatedLetters("ÅBNER")).toBe(false);
    expect(hasRepeatedLetters("ØJNØR")).toBe(true);
  });
});

describe("score", () => {
  const ANSWER = "GRØNT";

  it("scores a winning guess as all green", () => {
    expect(score("GRØNT", ANSWER)).toEqual({ green: 5, yellow: 0, red: 0 });
  });

  it("scores a guess with no letters in common as all red", () => {
    expect(score("BLIKS", ANSWER)).toEqual({ green: 0, yellow: 0, red: 5 });
  });

  it("separates placed from misplaced letters", () => {
    // TRANS: R and N are in place; T is in the word but misplaced; A and S are absent.
    expect(score("TRANS", ANSWER)).toEqual({ green: 2, yellow: 1, red: 2 });
  });

  it("scores an anagram as almost all yellow", () => {
    // TNØRG holds only Ø in its original position.
    expect(score("TNØRG", ANSWER)).toEqual({ green: 1, yellow: 4, red: 0 });
  });

  it("counts a repeated guess letter only as often as the answer contains it", () => {
    // The answer has one G, so four of the five Gs cannot match anything.
    expect(score("GGGGG", ANSWER)).toEqual({ green: 1, yellow: 0, red: 4 });
  });

  it("handles Æ, Ø and Å as single characters", () => {
    expect(score("BLÅST", "ÅBENT")).toEqual({ green: 1, yellow: 2, red: 2 });
  });

  it("is not fooled by lowercase input being a different string", () => {
    // Guard against a caller forgetting to uppercase: lowercase letters simply
    // do not match, which is visible rather than silently wrong.
    expect(score("grønt", ANSWER)).toEqual({ green: 0, yellow: 0, red: 5 });
  });
});

describe("score invariants", () => {
  /** Every answer the game can produce: five distinct Danish letters. */
  function randomAnswer(): string {
    const pool = [...ALPHABET];
    const picked: string[] = [];
    while (picked.length < WORD_LENGTH) {
      const [letter] = pool.splice(Math.floor(Math.random() * pool.length), 1);
      picked.push(letter);
    }
    return picked.join("");
  }

  /** Any five letters, repeats allowed — guesses are not restricted. */
  function randomGuess(): string {
    return Array.from(
      { length: WORD_LENGTH },
      () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)],
    ).join("");
  }

  it("always returns three non-negative counts summing to the word length", () => {
    for (let i = 0; i < 2000; i++) {
      const answer = randomAnswer();
      const guess = randomGuess();
      const { green, yellow, red } = score(guess, answer);

      const context = `guess=${guess} answer=${answer}`;
      expect(green, context).toBeGreaterThanOrEqual(0);
      expect(yellow, context).toBeGreaterThanOrEqual(0);
      expect(red, context).toBeGreaterThanOrEqual(0);
      expect(green + yellow + red, context).toBe(WORD_LENGTH);
    }
  });
});

describe("the no-repeated-letters rule score depends on", () => {
  it("breaks if the answer repeats a letter, so the rule must stay enforced", () => {
    // KAKAO has two Ks. Guessing KKKKK places two of them correctly, but only
    // one *distinct* letter is shared, so yellow underflows to -1.
    //
    // This test documents the boundary rather than the desired behaviour. If a
    // repeated-letter difficulty is ever added, this fails first and points at
    // score() — where the fix is to sum min(count in guess, count in answer)
    // per letter instead of counting distinct shared letters.
    expect(hasRepeatedLetters("KAKAO")).toBe(true);
    expect(score("KKKKK", "KAKAO").yellow).toBe(-1);
  });
});
