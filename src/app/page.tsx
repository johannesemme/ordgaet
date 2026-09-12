import { startGame } from "@/lib/game";
import { Game } from "./game/Game";

// Every visitor needs their own game, so this page can never be cached.
export const dynamic = "force-dynamic";

/**
 * The route "/".
 *
 * A Server Component, so the first game is created here — before any HTML is
 * sent — rather than by the browser after it loads. That saves a round trip
 * and avoids the page appearing empty for a moment.
 *
 * <Game> is a Client Component because it needs state, key handling and fetch.
 */
export default async function Home() {
  let initialGameId: string | null = null;
  let startupError: string | null = null;

  try {
    ({ gameId: initialGameId } = await startGame());
  } catch (error) {
    console.error("Could not start the first game:", error);
    startupError = "Kunne ikke starte spillet.";
  }

  return <Game initialGameId={initialGameId} startupError={startupError} />;
}
