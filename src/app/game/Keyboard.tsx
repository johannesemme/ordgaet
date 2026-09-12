"use client";

import styles from "./Keyboard.module.css";
import { KEY_ROWS } from "./types";

type Props = {
  /** Letters used in an earlier guess. They dim, but reveal nothing. */
  usedLetters: Set<string>;
  disabled: boolean;
  onLetter: (letter: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSpace: () => void;
  onSubmit: () => void;
};

export function Keyboard({
  usedLetters,
  disabled,
  onLetter,
  onBackspace,
  onClear,
  onSpace,
  onSubmit,
}: Props) {
  return (
    <div className={styles.keyboard}>
      {KEY_ROWS.map((row, i) => (
        <div className={styles.row} key={i}>
          {row.map((letter) => (
            <button
              key={letter}
              type="button"
              disabled={disabled}
              className={`${styles.key} ${usedLetters.has(letter) ? styles.used : ""}`}
              onClick={() => onLetter(letter)}
            >
              {letter}
            </button>
          ))}
          {/* Backspace shares the bottom letter row, as on the original. */}
          {i === KEY_ROWS.length - 1 && (
            <button
              type="button"
              disabled={disabled}
              className={styles.key}
              onClick={onBackspace}
              aria-label="Slet bogstav"
            >
              ⌫
            </button>
          )}
        </div>
      ))}

      <div className={styles.row}>
        <button
          type="button"
          disabled={disabled}
          className={styles.key}
          onClick={onClear}
          aria-label="Ryd rækken"
        >
          🧽
        </button>
        <button
          type="button"
          disabled={disabled}
          className={`${styles.key} ${styles.wide}`}
          onClick={onSpace}
          aria-label="Spring feltet over"
        >
          MELLEMRUM
        </button>
        <button
          type="button"
          disabled={disabled}
          className={styles.key}
          onClick={onSubmit}
          aria-label="Gæt"
        >
          ✓
        </button>
      </div>
    </div>
  );
}
