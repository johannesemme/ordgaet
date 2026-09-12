import { WORD_LENGTH } from "./config";

/**
 * The result of one guess: how many letters fall into each category.
 * Always sums to WORD_LENGTH.
 */
export type Score = {
  /** Right letter, right place. */
  green: number;
  /** Letter is in the answer, but in a different position. */
  yellow: number;
  /** Letter is not in the answer at all. */
  red: number;
};

/**
 * Answers must never repeat a letter — see score() for why.
 *
 * The database enforces this with a check constraint, so a bad row cannot be
 * written even by hand. This function exists so the import and the admin can
 * report the problem clearly instead of surfacing a Postgres error.
 */
export function hasRepeatedLetters(word: string): boolean {
  const letters = [...word];
  return new Set(letters).size !== letters.length;
}

/**
 * Score a guess against the answer.
 *
 * Both words must be uppercase and the same length, and the answer must not
 * repeat a letter. This function assumes all three; it does not check them.
 * Length and case are guaranteed by the words table's check constraints, and
 * the API uppercases each guess before it gets here.
 *
 * Greens are counted by position. Then we count the distinct letters the two
 * words share at all — placed or not — and subtract the greens to get yellows.
 * Whatever is left over is red.
 *
 * Counting *distinct* shared letters is correct only because the answer never
 * repeats a letter, so each of its letters appears exactly zero or one times.
 * If that rule were relaxed (answer KAKAO, guess KKKKK) this would return a
 * negative yellow. score.test.ts pins that boundary so the assumption cannot
 * be removed silently.
 *
 * Note [...word] rather than word.split(""): spreading iterates by Unicode
 * code point, which keeps Æ, Ø and Å as single characters.
 */
export function score(guess: string, answer: string): Score {
  const g = [...guess];
  const a = [...answer];

  const green = g.filter((letter, i) => letter === a[i]).length;
  const shared = [...new Set(g)].filter((letter) => a.includes(letter)).length;

  return { green, yellow: shared - green, red: WORD_LENGTH - shared };
}
