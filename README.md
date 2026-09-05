# Ordgæt

A Danish five-letter word game, live at **[ordgæt.dk](https://ordgæt.dk)**.

Guess the hidden word in eight attempts. After each guess you are told three
numbers — how many letters are correct and correctly placed, how many are in
the word but misplaced, and how many are not in the word at all.

You are never told **which** letters. That is the whole game.

```
G  R  Ø  N  T      1   1   3
                 green amber red
```

## Design

Two decisions shape everything else:

1. **The answer never reaches the browser.** The word list lives only in
   Postgres. The browser sends a guess and receives three numbers. There is
   nothing to decode, because nothing is encoded.
2. **Answers never repeat a letter.** This keeps the count arithmetic
   tractable for the player, and lets the scoring function count _distinct_
   shared letters rather than tracking multiplicities.

## Stack

|           |                                   |
| --------- | --------------------------------- |
| Framework | Next.js (App Router) + TypeScript |
| Styling   | CSS Modules                       |
| Database  | Supabase (Postgres)               |
| Hosting   | Vercel                            |
| Tests     | Vitest                            |

## Running it locally

```bash
npm install
npm run dev        # http://localhost:3000
```

## Checks

These are the same commands CI runs on every pull request. If any fails, the
pull request is blocked.

```bash
npm run format:check   # Prettier — is everything formatted consistently?
npm run lint           # ESLint — any unsafe or sloppy patterns?
npm run typecheck      # TypeScript — any type errors? (no build output)
npm test               # Vitest — does the logic still behave?
npm run build          # does it compile for production?
```

`npm run format` fixes formatting rather than just reporting on it.
