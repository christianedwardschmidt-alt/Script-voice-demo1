-- The Huddle — Supabase schema
-- Run this once in your Supabase project's SQL editor before using the app.

-- ============================================================
-- profiles
-- One row per authenticated user. Created automatically on sign-up.
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  favorite_team text not null default '',
  bio text not null default '',
  avatar_emoji text not null default '🏈',
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
  values (new.id, coalesce(split_part(new.email, '@', 1), 'Fan'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- posts — a "take" shared to the feed
-- ============================================================
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete cascade,
  team_tag text not null default '',
  content text not null check (char_length(content) between 1 and 500),
  created_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create policy "Posts are viewable by authenticated users"
  on public.posts for select
  to authenticated
  using (true);

create policy "Users can post their own takes"
  on public.posts for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "Users can delete their own posts"
  on public.posts for delete
  to authenticated
  using (auth.uid() = author_id);

-- ============================================================
-- post_reactions — one reaction (emoji) per user per post
-- ============================================================
create table if not exists public.post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

alter table public.post_reactions enable row level security;

create policy "Reactions are viewable by authenticated users"
  on public.post_reactions for select
  to authenticated
  using (true);

create policy "Users can react as themselves"
  on public.post_reactions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can change their own reaction"
  on public.post_reactions for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can remove their own reaction"
  on public.post_reactions for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- post_comments — replies on a take
-- ============================================================
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 300),
  created_at timestamptz not null default now()
);

alter table public.post_comments enable row level security;

create policy "Comments are viewable by authenticated users"
  on public.post_comments for select
  to authenticated
  using (true);

create policy "Users can comment as themselves"
  on public.post_comments for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "Users can delete their own comments"
  on public.post_comments for delete
  to authenticated
  using (auth.uid() = author_id);

-- ============================================================
-- follows — fans connecting with other fans
-- ============================================================
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles (id) on delete cascade,
  followed_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, followed_id),
  check (follower_id <> followed_id)
);

alter table public.follows enable row level security;

create policy "Follows are viewable by authenticated users"
  on public.follows for select
  to authenticated
  using (true);

create policy "Users can follow as themselves"
  on public.follows for insert
  to authenticated
  with check (auth.uid() = follower_id);

create policy "Users can unfollow as themselves"
  on public.follows for delete
  to authenticated
  using (auth.uid() = follower_id);

-- ============================================================
-- game_rooms — a live discussion room for a specific matchup
-- ============================================================
create table if not exists public.game_rooms (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  team_home text not null,
  team_away text not null,
  kickoff_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.game_rooms enable row level security;

create policy "Rooms are viewable by authenticated users"
  on public.game_rooms for select
  to authenticated
  using (true);

create policy "Users can open their own rooms"
  on public.game_rooms for insert
  to authenticated
  with check (auth.uid() = host_id);

create policy "Hosts can close their own rooms"
  on public.game_rooms for delete
  to authenticated
  using (auth.uid() = host_id);

-- ============================================================
-- game_room_messages — live chat within a game room
-- ============================================================
create table if not exists public.game_room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.game_rooms (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(content) between 1 and 300),
  created_at timestamptz not null default now()
);

alter table public.game_room_messages enable row level security;

create policy "Room messages are viewable by authenticated users"
  on public.game_room_messages for select
  to authenticated
  using (true);

create policy "Users can chat as themselves"
  on public.game_room_messages for insert
  to authenticated
  with check (auth.uid() = user_id);

-- ============================================================
-- Realtime — broadcast changes so the feed, reactions, and game
-- room chat update live for everyone watching.
-- ============================================================
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.post_reactions;
alter publication supabase_realtime add table public.post_comments;
alter publication supabase_realtime add table public.follows;
alter publication supabase_realtime add table public.game_rooms;
alter publication supabase_realtime add table public.game_room_messages;
