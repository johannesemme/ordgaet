import { WORD_LENGTH } from "./config";
import { hasRepeatedLetters } from "./score";

/** The 29 letters a Danish word may contain. */
const DANISH_LETTERS = new Set([..."ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ"]);

/** A word as it is stored: uppercase, exactly five Danish letters. */
export type ImportableWord = {
  word: string;
  /**
   * The word's five letters are all different.
   *
   * Answers must satisfy this, because score() counts distinct shared letters
   * and underflows otherwise. It is necessary but not sufficient: a word is
   * only drawn as an answer once someone also sets its in_use column.
   */
  noRepeats: boolean;
};

/**
 * Decide whether one line from the source dictionary belongs in the database,
 * and normalise it if so.
 *
 * Returns null for anything we do not want, so the caller can simply skip it.
 *
 * The rules, and why:
 *  - Proper nouns are dropped. The source capitalises them, so a leading
 *    capital is the signal. This removes names like METTE and ÅRHUS, which
 *    are real five-letter words but poor puzzle answers.
 *  - Exactly five letters.
 *  - Only the 29 Danish letters, which rejects hyphens, apostrophes and
 *    imported spellings like "cañon".
 *
 * Repeated letters are NOT a reason to reject. A word with repeats is a
 * perfectly legal guess — it is simply never eligible to be the hidden
 * answer, which is what the noRepeats flag records.
 */
export function toImportableWord(raw: string): ImportableWord | null {
  // The source is a hunspell dictionary: "word/AFFIXFLAGS".
  const bare = raw.split("/")[0].trim();
  if (bare.length === 0) return null;

  // A leading capital marks a proper noun in this source.
  if (bare[0] !== bare[0].toLocaleLowerCase("da-DK")) return null;

  const word = bare.toLocaleUpperCase("da-DK");
  const letters = [...word];

  if (letters.length !== WORD_LENGTH) return null;
  if (!letters.every((letter) => DANISH_LETTERS.has(letter))) return null;

  return { word, noRepeats: !hasRepeatedLetters(word) };
}

/**
 * Turn a whole dictionary file into the rows to insert, de-duplicated.
 * The first line of a hunspell .dic file is a count, not a word; it is
 * rejected by the rules above anyway, so no special case is needed.
 */
export function parseDictionary(contents: string): ImportableWord[] {
  const seen = new Map<string, ImportableWord>();
  for (const line of contents.split("\n")) {
    const entry = toImportableWord(line);
    if (entry && !seen.has(entry.word)) seen.set(entry.word, entry);
  }
  return [...seen.values()].sort((a, b) => a.word.localeCompare(b.word, "da-DK"));
}
