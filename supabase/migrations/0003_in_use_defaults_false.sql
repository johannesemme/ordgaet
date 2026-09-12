-- Correct the in_use semantics introduced in 0002.
--
-- Run in the Supabase SQL Editor after 0002_words_in_use.sql.
--
-- Two changes:
--
-- 1. Default to false, not true. Words are opted IN to the answer pool
--    deliberately, rather than being included until someone objects. A word
--    should only be a puzzle answer because it was chosen.
--
-- 2. A word can never be in_use unless no_repeats is also true. Answers must
--    have five distinct letters, because score() counts distinct shared
--    letters and underflows otherwise. Previously nothing stopped the two
--    columns disagreeing; now the database refuses the combination.

alter table public.words alter column in_use set default false;

-- 0002 defaulted every existing row to true. Reset them, so curation starts
-- from a clean slate rather than from three thousand accidental approvals.
update public.words set in_use = false where in_use;

alter table public.words drop constraint if exists words_in_use_requires_no_repeats;
alter table public.words
  add constraint words_in_use_requires_no_repeats
  check (no_repeats or not in_use);
