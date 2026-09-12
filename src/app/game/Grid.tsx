"use client";

import { MAX_GUESSES, WORD_LENGTH } from "@/lib/config";
import styles from "./Grid.module.css";
import { markKey, markLabel, type Marks } from "./marks";
import { BLANK, type PlayedRow } from "./types";

type Props = {
  played: PlayedRow[];
  current: string[];
  cursor: number;
  isPlaying: boolean;
  marks: Marks;
  onSelectCell: (index: number) => void;
  onToggleMark: (row: number, cell: number) => void;
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

export function Grid({
  played,
  current,
  cursor,
  isPlaying,
  marks,
  onSelectCell,
  onToggleMark,
}: Props) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: MAX_GUESSES }, (_, rowIndex) => {
        const row = played[rowIndex];
        const isCurrentRow = isPlaying && rowIndex === played.length;

        return (
          <div className={styles.row} key={rowIndex}>
            {Array.from({ length: WORD_LENGTH }, (_, i) => {
              // A played letter: clicking cycles the player's own colour note.
              if (row) {
                const mark = marks[markKey(rowIndex, i)] ?? null;
                return (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.cell} ${mark ? styles[`mark_${mark}`] : ""}`}
                    onClick={() => onToggleMark(rowIndex, i)}
                    title={`${row.word[i]} — ${markLabel(mark)}`}
                    aria-label={`${row.word[i]}, ${markLabel(mark)}. Klik for at skifte farve.`}
                  >
                    {row.word[i]}
                  </button>
                );
              }

              // The row being typed: clicking moves the cursor.
              if (isCurrentRow) {
                const letter = current[i];
                return (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.cell} ${i === cursor ? styles.cursor : ""}`}
                    onClick={() => onSelectCell(i)}
                    aria-label={`Bogstav ${i + 1}`}
                  >
                    {letter === BLANK ? "" : letter}
                  </button>
                );
              }

              // A row not yet reached.
              return <span key={i} className={styles.cell} />;
            })}
            <Signals row={row} />
          </div>
        );
      })}
    </div>
  );
}
