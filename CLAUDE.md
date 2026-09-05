@AGENTS.md

# Ordgæt

Danish five-letter deduction game. See README.md for the rules.

## Rules that must not drift

- The answer and the word list must **never** be sent to the browser while a
  game is active. Scoring happens on the server. The only exception is
  revealing the answer once `status !== "active"`.
- Answers never contain a repeated letter. This is enforced by the
  `no_repeats` column in Postgres, and the scoring function depends on it.
- Iterate words with `[...word]`, never `word.split("")` — Æ, Ø and Å must
  stay single characters.
- The Supabase **service role key** is server-only. It must never appear in a
  Client Component or in any file that ships to the browser.

## Working agreement

One pull request per feature, small enough to read in one sitting.
