"use client";

import { MAX_GUESSES, WORD_LENGTH } from "@/lib/config";
import styles from "./Grid.module.css";
import { BLANK, type PlayedRow } from "./types";

type Props = {
  played: PlayedRow[];
  current: string[];
  cursor: number;
  isPlaying: boolean;
  onSelectCell: (index: number) => void;
};

/** The three count cells shown to the right of every row. */
function Signals({ row }: { row?: PlayedRow }) {
  const cells = [
    { key: "green", value: row?.green },
    { key: "yellow", value: row?.yellow },
    { key: "red", value: row?.red },
  ] as const;

  return (
    <>
      <span className={styles.gap} />
      {cells.map(({ key, value }) => (
        <span
          key={key}
          className={`${styles.signal} ${styles[key]} ${value === undefined ? styles.pending : ""}`}
        >
          {value ?? ""}
        </span>
      ))}
    </>
  );
}

export function Grid({ played, current, cursor, isPlaying, onSelectCell }: Props) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: MAX_GUESSES }, (_, rowIndex) => {
        const row = played[rowIndex];
        const isCurrentRow = isPlaying && rowIndex === played.length;

        return (
          <div className={styles.row} key={rowIndex}>
            {Array.from({ length: WORD_LENGTH }, (_, i) => {
              const letter = row ? row.word[i] : isCurrentRow ? current[i] : "";
              const shown = letter === BLANK ? "" : letter;

              // Only the row being typed is interactive; the rest are plain cells.
              return isCurrentRow ? (
                <button
                  key={i}
                  type="button"
                  className={`${styles.cell} ${i === cursor ? styles.cursor : ""}`}
                  onClick={() => onSelectCell(i)}
                  aria-label={`Bogstav ${i + 1}`}
                >
                  {shown}
                </button>
              ) : (
                <span key={i} className={styles.cell}>
                  {shown}
                </span>
              );
            })}
            <Signals row={row} />
          </div>
        );
      })}
    </div>
  );
}
