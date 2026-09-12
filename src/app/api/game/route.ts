import { MAX_GUESSES, WORD_LENGTH } from "@/lib/config";
import { startGame } from "@/lib/game";

/**
 * POST /api/game — start a new game.
 *
 * Returns the game's id and the rules. Deliberately NOT the answer: the
 * browser is told what to draw, never what to draw it for.
 */
export async function POST() {
  try {
    const { gameId } = await startGame();
    return Response.json({ gameId, wordLength: WORD_LENGTH, maxGuesses: MAX_GUESSES });
  } catch (error) {
    console.error("POST /api/game failed:", error);
    return Response.json({ error: "could_not_start_game" }, { status: 500 });
  }
}
