/**
 * Game-wide constants.
 *
 * These live in one place so the rules can never drift apart between
 * the scoring logic, the API and the interface.
 */

/** Length of every word in the game. */
export const WORD_LENGTH = 5;

/** How many attempts a player gets before the game is lost. */
export const MAX_GUESSES = 8;

/**
 * The Danish alphabet, in keyboard order.
 * Æ, Ø and Å are single characters — never split a word with .split("").
 */
export const ALPHABET = [..."QWERTYUIOPÅASDFGHJKLÆØZXCVBNM"] as const;
