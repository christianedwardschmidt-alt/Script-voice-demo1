-- The Table — Supabase schema
-- Run this once in your Supabase project's SQL editor before using the app.

-- ============================================================
-- profiles
-- One row per authenticated user. Created automatically on sign-up.
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  city text not null default '',
  bio text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a profile row whenever a new user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(split_part(new.email, '@', 1), 'Player'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- tables — a hosted game session ("table")
-- ============================================================
create table if not exists public.tables (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles (id) on delete cascade,
  game text not null,
  session_date date not null,
  session_time time not null,
  location text not null,
  max_players int not null check (max_players >= 2 and max_players <= 10),
  experience text not null default 'Open to all',
  notes text not null default '',
  created_at timestamptz not null default now()
);

alter table public.tables enable row level security;

create policy "Tables are viewable by authenticated users"
  on public.tables for select
  to authenticated
  using (true);

create policy "Users can host (insert) their own tables"
  on public.tables for insert
  to authenticated
  with check (auth.uid() = host_id);

create policy "Hosts can update their own tables"
  on public.tables for update
  to authenticated
  using (auth.uid() = host_id)
  with check (auth.uid() = host_id);

create policy "Hosts can delete their own tables"
  on public.tables for delete
  to authenticated
  using (auth.uid() = host_id);

-- ============================================================
-- table_players — seats claimed at a table
-- ============================================================
create table if not exists public.table_players (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references public.tables (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  unique (table_id, user_id)
);

alter table public.table_players enable row level security;

create policy "Seats are viewable by authenticated users"
  on public.table_players for select
  to authenticated
  using (true);

-- Direct inserts are blocked; seat-claiming must go through join_table()
-- below so seat limits are enforced atomically. No insert policy is
-- granted here, so only the security-definer function can write rows.

create policy "Users can leave a table they joined"
  on public.table_players for delete
  to authenticated
  using (auth.uid() = user_id);

-- Atomically claim a seat, respecting max_players even under concurrent
-- requests from different users (locks the table row for the duration
-- of the check-and-insert).
create or replace function public.join_table(p_table_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_max int;
  v_count int;
begin
  select max_players into v_max
  from public.tables
  where id = p_table_id
  for update;

  if v_max is null then
    raise exception 'Table not found';
  end if;

  select count(*) into v_count
  from public.table_players
  where table_id = p_table_id;

  if v_count >= v_max then
    raise exception 'Table is full';
  end if;

  insert into public.table_players (table_id, user_id)
  values (p_table_id, auth.uid())
  on conflict (table_id, user_id) do nothing;
end;
$$;

grant execute on function public.join_table(uuid) to authenticated;

-- ============================================================
-- library_games — a user's personal "My Games" shelf
-- ============================================================
create table if not exists public.library_games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  game_name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, game_name)
);

alter table public.library_games enable row level security;

create policy "Users can view their own library"
  on public.library_games for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can add to their own library"
  on public.library_games for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can remove from their own library"
  on public.library_games for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- Realtime — broadcast changes so seat-claiming updates live
-- across everyone viewing the Discover tab.
-- ============================================================
alter publication supabase_realtime add table public.tables;
alter publication supabase_realtime add table public.table_players;
