# LifeOS

A private personal dashboard frontend, built with Next.js 16.3.5, React 19, TypeScript, Tailwind CSS 4, Geist, Lucide, Recharts, date-fns, and accessible Radix dialog/tab primitives.

## Run locally

Use Node.js 22 or newer. From this project folder:

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). For a production preview:

```sh
npm run build
npm start
```

## Included

- Dashboard: audience cards, today's checklist, goal progress, subscriptions, and internal notifications.
- Tasks: Today, Upcoming (including overdue tasks), and grouped Monthly views. Inbox links open the relevant tab.
- Goals: typed goal cards, creation, and editable progress.
- Creator: five historical ranges, interactive platform visibility, and chart tooltips.
- Subscriptions: variable-size grid, responsive list, manual addition, and separate totals for NGN, USD, GBP, and EUR.
- Inbox: read states, mark-all-read, dismissal, and contextual links.
- Calendar: month navigation, selectable days, and events drawn from the current task, goal, and subscription state.
- Settings: display name, light/dark/system appearance, currency, week start, and a future reminder preference. Creator connections are explicitly unavailable.
- Global quick add: keyboard-accessible dialog on desktop and bottom sheet on mobile. Secondary mobile routes are accessible from the quick-add menu.

## Project structure

```text
src/app/                       App Router routes, layout, loading and not-found states
src/components/layout/         Desktop sidebar, top bar, mobile navigation
src/components/dashboard/      Dashboard composition and reusable social cards
src/components/tasks/          Task checklist, progress, and grouped views
src/components/goals/          Goal cards, progress, and page
src/components/creator/        Audience chart and period controls
src/components/subscriptions/  Grid, tiles, responsive list, and page
src/components/inbox/          Reusable notification rows and page
src/components/calendar/       Basic month calendar and daily agenda
src/components/settings/       Local preferences
src/components/shared/         Typed state provider, dialogs, empty states, skeletons
src/lib/types.ts               Shared domain models
src/lib/mock-data.ts           Centralized typed demo data and fixed demo clock
src/lib/subscription-utils.ts  Billing normalization and currency-specific totals
src/app/globals.css            Palette variables, visual system, responsive rules
tests/                        Calculation and browser interaction checks
artifacts/                    Desktop/mobile preview screenshots
```

## Mock-data boundaries

All application data is mock data. State is shared across client-side navigation and resets on refresh. There is no authentication, database, server persistence, integration, or API route. Fonts are bundled locally; the UI does not fetch social or financial data.

The demo date is **September 20, 2026**, intentionally keeping mock tasks, reminders, calendar dates, and renewal labels consistent. The greeting uses the sample profile name, Somto, which can be changed in Settings.

Monthly subscription equivalents use `yearly / 12`, `weekly × 52 / 12`, and `custom × 365 / (12 × intervalDays)`. Custom intervals are required when adding a custom plan. Totals exclude inactive plans and never combine currencies. The stored renewal date is entered manually; automatic renewal scheduling is outside this prototype.

To connect real data later, replace the provider's initial data and mutation handlers. Presentational components already accept the shared domain types. Calendar events derive from the same state, and subscription calculations are centralized.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

With the app running on port 3000 and Google Chrome installed:

```sh
npm run test:browser
node scripts/capture-preview.mjs
```

The browser suite covers all eight routes at 1440, 1024, 820, 768, 390, and 360 pixels, plus task completion, quick add, goal updates, custom subscription billing, currency isolation, chart periods, calendar navigation, settings, inbox actions, and mobile navigation. Screenshots are saved in `artifacts/`.

Dialogs trap focus, close with Escape, and restore focus. Tabs use keyboard-accessible Radix primitives; task controls use native checkboxes. A skip link, visible focus states, live announcements, semantic headings, and reduced-motion styles are included.

Format source with `npm run format`.
