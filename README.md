# Fresh Court

A mobile-first tennis meetup app. Find nearby players matched to your skill level, send play invites, book coaching sessions, and manage your player profile.

Built with Next.js and Supabase (Postgres + Auth), styled as a native-feeling iOS app in the browser.

## Screens

- **Home** — your next confirmed match, pending invites, players near you, quick actions to find a court or coach.
- **Matches** (Find Players) — browse and filter nearby players by skill level, distance, and weekend availability; send play invites.
- **Coaches** — a featured beginner-friendly coach plus a directory of other coaches; book a session.
- **Profile** — edit your name, NTRP skill level, home court, and what you're looking for.

## Setup

1. Create a Supabase project.
2. Run `supabase-schema.sql` in the Supabase SQL editor to create tables, row-level security policies, and seed the coach directory.
3. Copy `.env.local.example` to `.env.local` and fill in your Supabase project URL and anon key.
4. `npm install`
5. `npm run dev`
