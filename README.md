# Trainer

A mobile-style app for personal trainers to manage client communication, run live video coaching sessions, schedule appointments, and track client progress.

Built with Next.js (App Router) + TypeScript, styled to a dark, electric-blue design system (Sora + Manrope). All data is in-memory mock data — no backend required.

## Screens

- **Home** — today's load at a glance: next session, quick stats, today's schedule.
- **Clients** — client list → per-client progress detail (weight trend, sessions, streak, goals).
- **Messages** — conversation list → chat thread.
- **Schedule** — week strip + agenda, add new sessions.
- **Video Session** — live call UI with mute/camera toggles, in-call chat drawer, and a post-session summary.
- **Profile** — trainer account info.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The layout targets a 390px-wide phone viewport and centers itself on larger screens.
