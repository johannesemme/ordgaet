/**
 * Player annotations on already-played letters.
 *
 * The game reports only counts — three numbers, never which letters they refer
 * to. Working out which letter was the green one is the puzzle, and it needs
 * somewhere to write things down. These marks are that notepad.
 *
 * They are the player's own guesswork. Nothing here is checked against the
 * answer, nothing is sent to the server, and a wrong mark stays wrong.
 */

/** No mark, then the three colours, then back to none. */
export const MARK_CYCLE = [null, "green", "yellow", "red"] as const;

export type Mark = (typeof MARK_CYCLE)[number];

/** Marks are keyed by position: which row, which letter within it. */
export type Marks = Record<string, Mark>;

export function markKey(row: number, cell: number): string {
  return `${row}:${cell}`;
}

/** The next mark in the cycle, wrapping back to none after red. */
export function nextMark(current: Mark): Mark {
  const index = MARK_CYCLE.indexOf(current ?? null);
  return MARK_CYCLE[(index + 1) % MARK_CYCLE.length];
}

/** Danish label for a screen reader, and for the cell's title attribute. */
export function markLabel(mark: Mark): string {
  switch (mark) {
    case "green":
      return "markeret grøn";
    case "yellow":
      return "markeret gul";
    case "red":
      return "markeret rød";
    default:
      return "ikke markeret";
  }
}
