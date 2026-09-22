# LifeOS

LifeOS is a private personal dashboard built with Next.js 16, React 19, TypeScript, and Supabase. It keeps tasks, goals, subscriptions, an internal inbox, calendar events, profile settings, and creator statistics in one owner-only workspace.

## Local setup

Use Node.js 22 or newer.

```sh
npm ci
copy .env.example .env.local
npm run dev
```

Fill `.env.local` with the linked Supabase project values. `NEXT_PUBLIC_APP_URL` should be `http://localhost:3000` locally and `https://lifeos-navy-six.vercel.app` in production. The secret Supabase key is only imported by server-only modules.

Create the owner account in Supabase Authentication using email and password. LifeOS intentionally has no public sign-up screen. A database trigger creates the corresponding profile, and existing Auth users are backfilled by the migration.

## Database

SQL migrations live in `supabase/migrations`. They create the application tables, validation constraints, indexes, update triggers, grants, and owner-only Row Level Security policies. `oauth_credentials` has RLS enabled, no browser policies, and no `anon` or `authenticated` privileges.

```sh
npx supabase db push --dry-run
npx supabase db push
npx supabase gen types typescript --linked --schema public > src/lib/database.types.ts
```

The checked-in database types are generated from the linked schema. Do not edit them by hand.

## Authentication and routes

`/login`, `/privacy`, and `/terms` are public. The Next.js 16 `proxy.ts` session layer protects the dashboard and refreshes Supabase auth cookies. Every mutation route also validates the user and relies on RLS or explicit server-side ownership checks.

Profile preferences, task completion, quick additions, goal check-ins, subscription entries, and inbox read/dismiss state are persisted. The internal inbox is generated from real overdue tasks, approaching goal deadlines, upcoming subscription renewals, provider connection errors, and audience milestones. Deterministic event keys prevent duplicate notifications.

## Creator connections

YouTube uses Google's server-side OAuth flow with the `youtube.readonly` scope, offline access, refresh tokens, and `channels.list?mine=true`. Configure these exact callback URLs in Google Cloud:

- `http://localhost:3000/api/integrations/youtube/callback`
- `https://lifeos-navy-six.vercel.app/api/integrations/youtube/callback`

YouTube may return rounded public subscriber totals; LifeOS stores and displays the value supplied by the API without inventing extra precision.

TikTok uses Login Kit v2 with `user.info.basic,user.info.stats`. The current credentials are treated as Sandbox credentials. TikTok requires an HTTPS redirect, so connection is available from the deployed app using:

- `https://lifeos-navy-six.vercel.app/api/integrations/tiktok/callback`

Instagram remains in a visible **Needs setup** state until official Meta developer access is ready.

OAuth state is stored in a short-lived HttpOnly, SameSite=Lax cookie and compared safely on callback. Provider tokens stay server-side. Disconnect removes credentials, attempts provider revocation, marks the account disconnected, and preserves historical snapshots.

## Synchronization

Connected accounts can be synced manually from Settings. Manual calls have a one-minute guard per account. `vercel.json` schedules one daily run at 06:00 UTC through `/api/cron/social-sync`.

Set a strong `CRON_SECRET` in Vercel to enable automatic synchronization. Vercel sends it as `Authorization: Bearer <CRON_SECRET>`. If a future plan supports more frequent schedules, the cron can be changed to every six hours. One provider failure is isolated from the others.

## Appearance persistence

The root `next-themes` provider is the browser UI source of truth. It stores the Light, Dark, or System choice under `lifeos-theme` and applies the resolved class to `<html>` before paint. For signed-in users, the server supplies the profile appearance as the first-visit default. A browser choice takes precedence during reconciliation and is then copied to the profile for cross-device synchronization; a late profile fetch never changes an already restored browser theme.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

Public browser tests run without credentials. Authenticated browser coverage is enabled only when the documented E2E owner credentials are present, so secrets never need to be committed.

```sh
npm run test:browser
```
