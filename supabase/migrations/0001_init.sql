-- Ordgæt initial schema.
--
-- Run this once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).
-- It is kept in the repo so the schema is version-controlled and reviewable,
-- even though we apply it by hand rather than with a migration tool.

-- ---------------------------------------------------------------------------
-- words
-- ---------------------------------------------------------------------------
-- Every legal five-letter Danish word. A guess is valid if it appears here.
--
-- no_repeats marks the subset that may be chosen as an ANSWER. Answers never
-- contain the same letter twice, because score() counts distinct shared letters
-- and would underflow otherwise. Guesses may repeat letters freely — TØRRE is a
-- perfectly good guess, it just can never be the hidden word.

create table if not exists public.words (
  id         uuid primary key default gen_random_uuid(),
  word       text        not null unique,
  no_repeats boolean     not null,
  created_at timestamptz not null default now(),

  -- Enforce the rules in the database, not just in application code.
  constraint words_length_is_five check (char_length(word) = 5),
  constraint words_is_uppercase   check (word = upper(word))
);

-- Answers are drawn with "where no_repeats", so that lookup needs an index.
create index if not exists words_no_repeats_idx on public.words (no_repeats);

-- ---------------------------------------------------------------------------
-- games
-- ---------------------------------------------------------------------------
-- One row per game in progress. The answer lives here and never leaves the
-- server until the game is over.

create table if not exists public.games (
  id          uuid primary key default gen_random_uuid(),
  answer      text        not null,
  guesses     jsonb       not null default '[]'::jsonb,
  status      text        not null default 'active',
  created_at  timestamptz not null default now(),
  finished_at timestamptz,

  constraint games_status_is_known check (status in ('active', 'won', 'lost'))
);

create index if not exists games_status_idx on public.games (status);

-- ---------------------------------------------------------------------------
-- Security
-- ---------------------------------------------------------------------------
-- Row Level Security with NO policies means: nobody can read or write these
-- tables through the public API. The anon key ships to the browser and is
-- readable by anyone, so RLS is the only thing protecting the word list.
--
-- Our server code uses the service_role key, which bypasses RLS entirely.

alter table public.words enable row level security;
alter table public.games enable row level security;

-- Because "Automatically expose new tables" was disabled when the project was
-- created, privileges are not granted by default. Grant them explicitly to the
-- server role only — anon and authenticated get nothing at all.
grant usage on schema public to service_role;
grant all privileges on public.words to service_role;
grant all privileges on public.games to service_role;

revoke all on public.words from anon, authenticated;
revoke all on public.games from anon, authenticated;
