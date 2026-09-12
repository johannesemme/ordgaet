-- Add in_use: which words are allowed to be chosen as the hidden answer.
--
-- Run in the Supabase SQL Editor after 0001_init.sql.
--
-- no_repeats says whether a word CAN be an answer (a rule of the game).
-- in_use says whether we WANT it to be (a matter of taste). The source
-- dictionary contains plenty of real but dull or obscure words — DECCA,
-- CRURA, DATJA — that are fair guesses but poor puzzles.
--
-- Defaults to true, so curation is by exception: switch off the words you
-- dislike rather than approving three thousand by hand.
--
-- in_use does NOT affect whether a word is a legal guess. A dull word is
-- still a real Danish word and must remain guessable.

alter table public.words
  add column if not exists in_use boolean not null default true;

-- Answers are selected with "where no_repeats and in_use", so index the pair.
create index if not exists words_answer_pool_idx
  on public.words (no_repeats, in_use);
