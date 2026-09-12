import "server-only";
import { MAX_GUESSES, WORD_LENGTH } from "./config";
import { nextStatus, normaliseGuess, type GameStatus } from "./rules";
import { score, type Score } from "./score";
import { supabaseAdmin } from "./supabase";

/** One scored guess, as stored in games.guesses. */
export type PlayedGuess = Score & { word: string };

/** What the browser is told about a guess. Note there is no `answer` while active. */
export type GuessResult = Score & {
  guessesUsed: number;
  maxGuesses: number;
  status: GameStatus;
  /** The hidden word — present ONLY once the game is over. */
  answer?: string;
};

/** Every way a guess can be refused, with the HTTP status each maps to. */
export type GuessError =
  | { error: "not_found"; status: 404 }
  | { error: "game_over"; status: 409 }
  | { error: "wrong_length"; status: 400 }
  | { error: "unknown_word"; status: 409 };

/**
 * Start a game.
 *
 * The answer is chosen here and written to the database. It is never returned;
 * the caller gets only the row's id, which is a receipt, not a secret.
 *
 * Answers come from `no_repeats and in_use` — the first is a rule of the game,
 * the second is curation. If nothing is curated yet there is no game to play,
 * which is a configuration problem rather than a user error, hence the throw.
 */
export async function startGame(): Promise<{ gameId: string }> {
  const db = supabaseAdmin();

  const { count, error: countError } = await db
    .from("words")
    .select("*", { count: "exact", head: true })
    .eq("no_repeats", true)
    .eq("in_use", true);

  if (countError) throw new Error(`Could not count answers: ${countError.message}`);
  if (!count) throw new Error("No words are marked in_use, so there is no answer to pick.");

  // Pick by random offset rather than downloading the whole pool.
  const offset = Math.floor(Math.random() * count);
  const { data: picked, error: pickError } = await db
    .from("words")
    .select("word")
    .eq("no_repeats", true)
    .eq("in_use", true)
    .range(offset, offset)
    .single();

  if (pickError || !picked) throw new Error(`Could not pick an answer: ${pickError?.message}`);

  const { data: game, error: insertError } = await db
    .from("games")
    .insert({ answer: picked.word })
    .select("id")
    .single();

  if (insertError || !game) throw new Error(`Could not create game: ${insertError?.message}`);

  return { gameId: game.id };
}

/**
 * Score one guess against a game, and record it.
 *
 * Everything happens here rather than in the browser: the answer is read from
 * the database, compared, and only the three counts go back. An invalid word
 * does not consume an attempt — it never reaches the guesses array.
 */
export async function applyGuess(
  gameId: string,
  rawGuess: string,
): Promise<GuessResult | GuessError> {
  const db = supabaseAdmin();
  const guess = normaliseGuess(rawGuess);

  if ([...guess].length !== WORD_LENGTH) return { error: "wrong_length", status: 400 };

  const { data: game } = await db
    .from("games")
    .select("id, answer, guesses, status")
    .eq("id", gameId)
    .maybeSingle();

  if (!game) return { error: "not_found", status: 404 };
  if (game.status !== "active") return { error: "game_over", status: 409 };

  // A guess must be a real Danish word. This is also the only query that can
  // tell an attacker anything, and all it reveals is whether a word exists.
  const { data: known } = await db.from("words").select("word").eq("word", guess).maybeSingle();
  if (!known) return { error: "unknown_word", status: 409 };

  const counts = score(guess, game.answer);
  const played = [...(game.guesses as PlayedGuess[]), { word: guess, ...counts }];
  const status = nextStatus(counts.green, played.length);

  const { error: updateError } = await db
    .from("games")
    .update({
      guesses: played,
      status,
      finished_at: status === "active" ? null : new Date().toISOString(),
    })
    .eq("id", gameId);

  if (updateError) throw new Error(`Could not save guess: ${updateError.message}`);

  return {
    ...counts,
    guessesUsed: played.length,
    maxGuesses: MAX_GUESSES,
    status,
    // The one place the answer is allowed out, and only once it no longer matters.
    ...(status === "active" ? {} : { answer: game.answer }),
  };
}
