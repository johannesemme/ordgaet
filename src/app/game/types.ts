import type { GameStatus } from "@/lib/rules";
import type { Score } from "@/lib/score";

/** A guess the server has already scored. */
export type PlayedRow = Score & { word: string };

/** The response from POST /api/game/[id]/guess. */
export type GuessResponse = Score & {
  guessesUsed: number;
  maxGuesses: number;
  status: GameStatus;
  answer?: string;
};

/** Danish keyboard layout. Æ and Ø sit where they do on a real Danish keyboard. */
export const KEY_ROWS = [[..."QWERTYUIOPÅ"], [..."ASDFGHJKLÆØ"], [..."ZXCVBNM"]] as const;

/** A blank cell the player has skipped past with the space key. */
export const BLANK = "_";
