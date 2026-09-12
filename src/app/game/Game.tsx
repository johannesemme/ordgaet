"use client";

import { useCallback, useEffect, useState } from "react";
import { MAX_GUESSES, WORD_LENGTH } from "@/lib/config";
import type { GameStatus } from "@/lib/rules";
import styles from "./Game.module.css";
import { Grid } from "./Grid";
import { Keyboard } from "./Keyboard";
import { markKey, nextMark, type Marks } from "./marks";
import { BLANK, KEY_ROWS, type GuessResponse, type PlayedRow } from "./types";

const LETTERS = new Set(KEY_ROWS.flat());
const emptyRow = () => Array<string>(WORD_LENGTH).fill(BLANK);

/** Danish text for every way a guess can be refused. */
const ERRORS: Record<string, string> = {
  unknown_word: "Ordet står ikke i ordbogen",
  wrong_length: `Ordet skal være på ${WORD_LENGTH} bogstaver`,
  game_over: "Spillet er slut",
  not_found: "Spillet blev ikke fundet",
};

type Props = {
  /** Created on the server so the first game is ready before the page renders. */
  initialGameId: string | null;
  startupError: string | null;
};

export function Game({ initialGameId, startupError }: Props) {
  const [gameId, setGameId] = useState<string | null>(initialGameId);
  const [played, setPlayed] = useState<PlayedRow[]>([]);
  const [current, setCurrent] = useState<string[]>(emptyRow);
  const [cursor, setCursor] = useState(0);
  const [status, setStatus] = useState<GameStatus>("active");
  const [answer, setAnswer] = useState<string | null>(null);
  const [message, setMessage] = useState(startupError ?? "");
  // The player's own colour notes on played letters. Local only — never sent
  // anywhere, never checked against the answer.
  const [marks, setMarks] = useState<Marks>({});
  const [busy, setBusy] = useState(false);

  const isPlaying = status === "active" && gameId !== null;

  /** Start another game. Only ever called from the "Spil igen" button. */
  const playAgain = useCallback(async () => {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/game", { method: "POST" });
      if (!response.ok) throw new Error();
      const { gameId } = await response.json();
      setGameId(gameId);
      setPlayed([]);
      setCurrent(emptyRow());
      setCursor(0);
      setStatus("active");
      setAnswer(null);
      setMarks({});
    } catch {
      setMessage("Kunne ikke starte spillet. Prøv igen.");
    } finally {
      setBusy(false);
    }
  }, []);

  /** Put a letter in the cursor cell and move to the next empty one. */
  const typeLetter = useCallback(
    (letter: string) => {
      setMessage("");
      setCurrent((row) => {
        const next = [...row];
        next[cursor] = letter;
        const after = next.findIndex((cell, i) => i > cursor && cell === BLANK);
        setCursor(after === -1 ? Math.min(cursor + 1, WORD_LENGTH - 1) : after);
        return next;
      });
    },
    [cursor],
  );

  const backspace = useCallback(() => {
    setMessage("");
    setCurrent((row) => {
      const next = [...row];
      // Clear the cursor cell if it holds a letter, otherwise step back and clear that.
      const target = next[cursor] !== BLANK ? cursor : Math.max(cursor - 1, 0);
      next[target] = BLANK;
      setCursor(target);
      return next;
    });
  }, [cursor]);

  const skip = useCallback(() => {
    setCursor((c) => Math.min(c + 1, WORD_LENGTH - 1));
  }, []);

  const clearRow = useCallback(() => {
    setMessage("");
    setCurrent(emptyRow());
    setCursor(0);
  }, []);

  /** Cycle one played letter's note: none -> green -> yellow -> red -> none. */
  const toggleMark = useCallback((row: number, cell: number) => {
    const key = markKey(row, cell);
    setMarks((current) => ({ ...current, [key]: nextMark(current[key] ?? null) }));
  }, []);

  const submit = useCallback(async () => {
    if (!gameId || busy || !isPlaying) return;

    const guess = current.join("");
    if (guess.includes(BLANK)) {
      setMessage(`Ordet skal være på ${WORD_LENGTH} bogstaver`);
      return;
    }

    setBusy(true);
    try {
      const response = await fetch(`/api/game/${gameId}/guess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(ERRORS[data.error] ?? "Noget gik galt");
        return;
      }

      const result = data as GuessResponse;
      setPlayed((rows) => [...rows, { word: guess, ...result }]);
      setCurrent(emptyRow());
      setCursor(0);
      setStatus(result.status);
      setMessage("");
      if (result.answer) setAnswer(result.answer);
    } catch {
      setMessage("Kunne ikke sende gættet. Er du online?");
    } finally {
      setBusy(false);
    }
  }, [busy, current, gameId, isPlaying]);

  // A physical or phone keyboard drives the same actions as the on-screen one.
  useEffect(() => {
    if (!isPlaying) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key;

      if (key === "Enter") return void submit();
      if (key === "Backspace") return backspace();
      if (key === " ") {
        event.preventDefault();
        return skip();
      }
      const letter = key.toLocaleUpperCase("da-DK");
      if (letter.length === 1 && LETTERS.has(letter)) typeLetter(letter);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [backspace, isPlaying, skip, submit, typeLetter]);

  // Letters already submitted. Deliberately says nothing about whether they were right.
  const usedLetters = new Set(played.flatMap((row) => [...row.word]));

  const outcome =
    status === "won"
      ? `Flot! Du gættede ordet på ${played.length} ${played.length === 1 ? "forsøg" : "forsøg"}.`
      : status === "lost"
        ? `Ordet var ${answer ?? "?"}.`
        : "";

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Ordgæt</h1>
        <p className={styles.subtitle}>
          Gæt ordet på {WORD_LENGTH} bogstaver. Du har {MAX_GUESSES} forsøg.
        </p>
      </header>

      <div className={styles.board}>
        <Grid
          played={played}
          current={current}
          cursor={cursor}
          isPlaying={isPlaying}
          marks={marks}
          onSelectCell={setCursor}
          onToggleMark={toggleMark}
        />

        <p className={`${styles.message} ${message ? styles.error : (styles[status] ?? "")}`}>
          {message || outcome}
        </p>

        {!isPlaying && gameId && (
          <button type="button" className={styles.again} onClick={playAgain} disabled={busy}>
            Spil igen
          </button>
        )}
      </div>

      <Keyboard
        usedLetters={usedLetters}
        disabled={!isPlaying || busy}
        onLetter={typeLetter}
        onBackspace={backspace}
        onClear={clearRow}
        onSpace={skip}
        onSubmit={submit}
      />
    </div>
  );
}
