create extension if not exists "pgcrypto";

create type jlpt_level as enum ('N5', 'N4', 'N3', 'N2', 'N1');
create type review_rating as enum ('again', 'hard', 'good', 'easy');

create table if not exists public.vocab_sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text,
  license text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.vocab_entries (
  id text primary key,
  word text not null,
  reading text not null,
  meaning_cn text not null default '',
  meaning_en text not null default '',
  jlpt_level jlpt_level not null,
  part_of_speech text,
  example text,
  audio text,
  tags text[] not null default '{}',
  source text not null default 'community',
  priority integer not null default 50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists vocab_entries_level_idx on public.vocab_entries (jlpt_level);
create index if not exists vocab_entries_priority_idx on public.vocab_entries (priority desc);
create index if not exists vocab_entries_search_idx on public.vocab_entries using gin (
  to_tsvector('simple', word || ' ' || reading || ' ' || meaning_cn || ' ' || meaning_en)
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  daily_new_limit integer not null default 12,
  target_level jlpt_level not null default 'N5',
  created_at timestamptz not null default now()
);

create table if not exists public.user_vocab_flags (
  user_id uuid not null references auth.users(id) on delete cascade,
  vocab_id text not null references public.vocab_entries(id) on delete cascade,
  favorite boolean not null default false,
  important boolean not null default false,
  primary key (user_id, vocab_id)
);

create table if not exists public.review_states (
  user_id uuid not null references auth.users(id) on delete cascade,
  vocab_id text not null references public.vocab_entries(id) on delete cascade,
  due_at timestamptz not null default now(),
  interval_days integer not null default 0,
  ease_factor numeric(4, 2) not null default 2.5,
  repetitions integer not null default 0,
  lapses integer not null default 0,
  last_rating review_rating,
  mastered boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, vocab_id)
);

create table if not exists public.review_logs (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  vocab_id text not null references public.vocab_entries(id) on delete cascade,
  rating review_rating not null,
  is_correct boolean not null,
  reviewed_at timestamptz not null default now()
);

create table if not exists public.daily_stats (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  learned integer not null default 0,
  reviewed integer not null default 0,
  correct integer not null default 0,
  total integer not null default 0,
  primary key (user_id, date)
);

alter table public.vocab_sources enable row level security;
alter table public.vocab_entries enable row level security;
alter table public.user_profiles enable row level security;
alter table public.user_vocab_flags enable row level security;
alter table public.review_states enable row level security;
alter table public.review_logs enable row level security;
alter table public.daily_stats enable row level security;

create policy "vocab entries are readable" on public.vocab_entries for select using (true);
create policy "sources are readable" on public.vocab_sources for select using (true);
create policy "users own profile" on public.user_profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "users own flags" on public.user_vocab_flags for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users own review states" on public.review_states for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users own review logs" on public.review_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users own daily stats" on public.daily_stats for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
