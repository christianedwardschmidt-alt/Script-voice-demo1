-- Fresh Court — Supabase schema
-- Run this once in your Supabase project's SQL editor before using the app.

-- ============================================================
-- profiles
-- One row per authenticated user. Created automatically on sign-up.
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  skill_level numeric(3,1) not null default 3.0 check (skill_level between 1.0 and 7.0),
  home_court text not null default '',
  note text not null default '',
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
-- invites — a play invite sent from one player to another,
-- proposing a court and a date/time.
-- ============================================================
create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  court text not null default '',
  scheduled_at timestamptz not null,
  message text not null default '',
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  check (sender_id <> recipient_id)
);

alter table public.invites enable row level security;

create policy "Invites are viewable by sender and recipient"
  on public.invites for select
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Users can send invites as themselves"
  on public.invites for insert
  to authenticated
  with check (auth.uid() = sender_id);

create policy "Recipients can accept or decline invites"
  on public.invites for update
  to authenticated
  using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);

create policy "Senders can cancel invites they sent"
  on public.invites for delete
  to authenticated
  using (auth.uid() = sender_id);

-- ============================================================
-- coaches — curated coach directory (read-only for players)
-- ============================================================
create table if not exists public.coaches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text not null default '',
  rating numeric(2,1) not null default 5.0,
  price_per_hour numeric not null default 50,
  is_featured boolean not null default false,
  beginner_friendly boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.coaches enable row level security;

create policy "Coaches are viewable by authenticated users"
  on public.coaches for select
  to authenticated
  using (true);

insert into public.coaches (name, specialty, rating, price_per_hour, is_featured, beginner_friendly)
select * from (values
  ('Elena Torres', 'Beginner specialist', 4.9, 45, true, true),
  ('Marcus Webb', 'Serve & technique', 4.8, 60, false, true),
  ('Grace Lin', 'Match strategy', 4.7, 55, false, false)
) as seed(name, specialty, rating, price_per_hour, is_featured, beginner_friendly)
where not exists (select 1 from public.coaches);

-- ============================================================
-- coach_bookings — a player's request to book a coaching session
-- ============================================================
create table if not exists public.coach_bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  coach_id uuid not null references public.coaches (id) on delete cascade,
  scheduled_at timestamptz not null,
  status text not null default 'requested' check (status in ('requested', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.coach_bookings enable row level security;

create policy "Users can view their own bookings"
  on public.coach_bookings for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can request bookings as themselves"
  on public.coach_bookings for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can cancel their own bookings"
  on public.coach_bookings for delete
  to authenticated
  using (auth.uid() = user_id);

-- ============================================================
-- Realtime — broadcast changes so invites and bookings update
-- live for everyone watching.
-- ============================================================
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.invites;
alter publication supabase_realtime add table public.coach_bookings;
