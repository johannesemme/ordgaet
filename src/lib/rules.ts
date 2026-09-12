import { MAX_GUESSES, WORD_LENGTH } from "./config";

/**
 * Game rules that involve no database and no network.
 *
 * Kept apart from game.ts so they can be tested directly. game.ts imports
 * "server-only", which deliberately refuses to load outside a server — a test
 * runner included.
 */

export type GameStatus = "active" | "won" | "lost";

/**
 * Uppercase and strip surrounding whitespace.
 *
 * toLocaleUpperCase("da-DK") rather than toUpperCase() so the casing rules are
 * Danish; the two agree for Æ, Ø and Å but being explicit costs nothing.
 */
export function normaliseGuess(raw: string): string {
  return raw.trim().toLocaleUpperCase("da-DK");
}

/**
 * Decide the game's state after a guess.
 *
 * Winning takes precedence: a correct guess on the eighth attempt is a win,
 * not a loss.
 */
export function nextStatus(green: number, guessesUsed: number): GameStatus {
  if (green === WORD_LENGTH) return "won";
  if (guessesUsed >= MAX_GUESSES) return "lost";
  return "active";
}
