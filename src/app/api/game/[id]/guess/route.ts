import type { NextRequest } from "next/server";
import { applyGuess } from "@/lib/game";

/**
 * POST /api/game/[id]/guess — submit one guess.
 *
 * Body:     { "guess": "GRØNT" }
 * Returns:  { green, yellow, red, guessesUsed, maxGuesses, status }
 *           plus `answer`, but only once status is no longer "active".
 *
 * A word that is not in the dictionary is refused with 409 and does NOT
 * consume an attempt.
 */
export async function POST(request: NextRequest, ctx: RouteContext<"/api/game/[id]/guess">) {
  // In Next 16 route params arrive as a promise and must be awaited.
  const { id } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  // Never trust the request body. Check the shape before using it.
  const guess = (body as { guess?: unknown })?.guess;
  if (typeof guess !== "string") {
    return Response.json({ error: "missing_guess" }, { status: 400 });
  }

  try {
    const result = await applyGuess(id, guess);
    if ("error" in result) {
      return Response.json({ error: result.error }, { status: result.status });
    }
    return Response.json(result);
  } catch (error) {
    console.error("POST /api/game/[id]/guess failed:", error);
    return Response.json({ error: "could_not_score_guess" }, { status: 500 });
  }
}
