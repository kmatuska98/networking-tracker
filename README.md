# Networking Tracker

A private, per-user tracker for the people you're networking with — who you met, where, why they matter, and when to follow up next. Built as a class assignment with the goal of also actually using it day to day: sign up, add contacts with a priority and a next follow-up date, and sort/filter your list as it grows. Every contact is scoped to the signed-in user via Postgres Row-Level Security, so no user can ever see or modify another user's contacts.

## Live app

**Live URL:** [https://networking-tracker-two-henna.vercel.app](https://networking-tracker-two-henna.vercel.app)

## Screenshots / walkthrough
<img width="290" height="240" alt="image" src="https://github.com/user-attachments/assets/39af4794-b167-458e-9085-ca0b190560f6" />

<img width="290" height="299" alt="image" src="https://github.com/user-attachments/assets/e77dc12a-fedc-46e0-b3ac-69047f41c372" />

<img width="290" height="240" alt="image" src="https://github.com/user-attachments/assets/3a0e1cbd-7591-4189-89d1-74b330cc27ad" />


> `TODO — replace with real screenshots or a short screen recording taken against the live app, covering:`
> - `Sign-up and sign-in`
> - `Sign-out`
> - `Adding a contact, editing it, deleting it, and refreshing the page to show it persisted`
> - `Sorting and filtering the contact list`
> - `An invalid submission (empty name / bad priority) failing with a clear inline error`
> - `Two separate accounts, showing Account A cannot see Account B's contacts`

## Features

- Email/password sign-up, sign-in, and sign-out via Neon Managed Better Auth
- A private contact list, scoped per user by database Row-Level Security (not just application code)
- Create, view, edit, delete, sort, and filter contacts
- Contact fields: name, company, role, where you met, notes, priority (`high` / `medium` / `low`), next follow-up date
- Sortable columns (name, priority, next follow-up date), filterable by priority and free-text search (name/company)
- Sort and filter state lives in the URL, so it survives a refresh and can be shared/bookmarked
- Distinct, understandable loading, empty, success, and error states throughout
- Backend validation (empty name, invalid priority, invalid date) that fails clearly and safely, backed by database-level constraints as well
- Responsive layout: a full table on tablet/desktop, stacked cards on mobile
- One automated Jest test suite covering the validation logic

## Technology stack and why

| Layer | Choice | Why |
|---|---|---|
| Frontend framework | Next.js (App Router) + TypeScript | File-based routing, built-in Server/Client component split, and first-class support for the layered frontend/backend structure this assignment requires, all in one deployable app |
| UI / component system | shadcn/ui (built on Base UI primitives) + Tailwind CSS | Accessible, unstyled primitives that are easy to theme consistently and look polished without a large design effort; works well responsively |
| Database | Neon Postgres | Serverless Postgres with native Row-Level Security, required by the assignment |
| Auth | Neon Managed Better Auth (`@neondatabase/neon-js/auth/next`) | Cookie-based session auth that's purpose-built for Next.js (middleware/proxy protection, RSC-friendly `getSession()`, a JWT endpoint the Data API can validate for RLS) |
| Data access | Neon Data API (PostgREST-compatible) via `@neondatabase/neon-js`'s `createClient` | Lets server-side code query Postgres over HTTPS with the signed-in user's own JWT, so RLS — not application code — is the source of truth for row ownership |
| Testing | Jest (`next/jest` preset) | Fast, zero-config-with-Next.js unit testing for the pure validation function, no database needed to run it |
| Hosting | Vercel | Native Next.js hosting, environment variable management, git-based deploys |

## Architecture

The app is a single Next.js project, but the **frontend and backend are strictly layered and physically separated in code**, not just conceptually:

- **Frontend** — `app/**/page.tsx`, `app/components/**`. These are React Server/Client Components. They render UI and, for anything that touches data, call **only** the app's own `/api/contacts` HTTP endpoints via `fetch`. No frontend file ever imports the database client or a server secret.
- **Backend** — `app/api/contacts/route.ts`, `app/api/contacts/[id]/route.ts`, and everything under `lib/server/**`. These files run only on the server (`lib/server/**` files start with `import "server-only"`, which fails the build if a client component ever imports them). This is where request validation happens, and it's the only code that talks to Neon.
- **Database** — Neon Postgres. One table, `contacts` (schema below), with Row-Level Security enabled so ownership is enforced by Postgres itself, independent of the API layer.
- **Auth** — Neon Managed Better Auth. `lib/server/auth.ts` creates a server-side auth instance (`createNeonAuth`) that backs: the auth API route (`app/api/auth/[...path]/route.ts`), route protection (`proxy.ts` — Next.js 16 renamed `middleware.ts` to `proxy.ts`), and per-request session/JWT lookups used by the backend. `lib/auth-client.ts` is the client-safe counterpart used by the sign-in/sign-up/sign-out UI.
- **Hosting** — Vercel, deployed from this GitHub repository.

### Request flow (writing a contact)

1. A Client Component (`ContactForm`) calls `fetch("/api/contacts", { method: "POST", credentials: "include", body: ... })`. The Better Auth session cookie rides along automatically.
2. `app/api/contacts/route.ts`'s `POST` handler runs `requireUser()` (`lib/server/require-user.ts`), which reads the current session server-side and returns `401` if there isn't one.
3. The raw JSON body is passed to `validateContactInput()` (`lib/validation/contact.validation.ts`) — a pure function with no DB/network dependency. Empty names and invalid priorities are rejected here with a `400` and field-specific error messages, before any database call happens.
4. If valid, `lib/server/contacts.repository.ts` (the app's Data Access Layer) calls the Neon Data API through a per-request client (`lib/server/data-client.ts`) that carries **the current user's own JWT** — not a shared admin connection. That JWT is what lets Postgres resolve `auth.user_id()` inside the RLS policies below.
5. Postgres enforces ownership via RLS regardless of what the API layer does — even a bug in the API code, or a request that bypasses this app entirely and hits the Data API directly, still can't read or write another user's rows.

## Local setup

```bash
git clone <this-repo-url>
cd networking-tracker
npm install
cp .env.example .env.local   # fill in real values from your Neon project — see below
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

Before contacts will actually save, you also need to run the SQL migrations in `db/` against your Neon project (see **Database schema** and **Deployment** below).

## Environment variables

Copy `.env.example` to `.env.local` and fill in real values from your Neon project's dashboard (Auth + Data API settings). **Never commit `.env.local`** — only `.env.example` (placeholders only) is tracked in git.

| Variable | Exposed to browser? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_NEON_AUTH_URL` | Yes | Public HTTPS URL of your Neon Auth instance |
| `NEXT_PUBLIC_NEON_DATA_API_URL` | Yes | Public HTTPS URL of your Neon Data API (PostgREST) endpoint |
| `DATABASE_URL` | **No — server only** | Raw Postgres connection string. Used only to run the migration SQL in `db/`, never by the running app |
| `NEON_AUTH_BASE_URL` | **No — server only** | Base URL Neon Auth's server SDK (`createNeonAuth`) proxies to |
| `NEON_AUTH_COOKIE_SECRET` | **No — server only** | Secret used to sign the session cookie (32+ characters — generate with `openssl rand -base64 32`) |

Every server-only variable above is read exclusively inside `lib/server/**` or `app/api/**/route.ts`, and those modules are guarded with `import "server-only"` so accidentally importing one from a Client Component fails the build rather than silently shipping a secret to the browser.

## Database schema

Defined in [`db/schema.sql`](db/schema.sql). One table, `contacts`:

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, `default gen_random_uuid()` |
| `user_id` | `text` | `not null`, `default auth.user_id()` — the owning user; never sent by the client, filled in by Postgres from the caller's JWT |
| `name` | `text` | `not null`, `check (btrim(name) <> '')` — rejects empty/whitespace-only names at the database level |
| `company` | `text` | nullable |
| `role` | `text` | nullable |
| `met_at` | `text` | nullable — free text describing where you met |
| `notes` | `text` | nullable |
| `priority` | `contact_priority` (enum: `high` \| `medium` \| `low`) | `not null default 'medium'` — the enum type itself rejects any other value |
| `next_follow_up_date` | `date` | nullable |
| `created_at` | `timestamptz` | `not null default now()` |
| `updated_at` | `timestamptz` | `not null default now()`, kept current by a trigger on every `UPDATE` |

Indexes on `user_id`, `priority`, and `next_follow_up_date` support the app's filter and sort queries.

## Authentication and RLS ownership

Row-Level Security policies live in [`db/rls_policies.sql`](db/rls_policies.sql):

```sql
alter table contacts enable row level security;

create policy contacts_select_own on contacts for select
  using (auth.user_id() = user_id);

create policy contacts_insert_own on contacts for insert
  with check (auth.user_id() = user_id);

create policy contacts_update_own on contacts for update
  using (auth.user_id() = user_id) with check (auth.user_id() = user_id);

create policy contacts_delete_own on contacts for delete
  using (auth.user_id() = user_id);
```

- **`using`** filters which *existing* rows a query is even allowed to see or target, for `SELECT`/`UPDATE`/`DELETE`.
- **`with check`** validates the *resulting* row being written, for `INSERT`/`UPDATE` — this is what stops a signed-in user from writing a row with someone else's `user_id`, even if they tried to pass one explicitly.
- Because `user_id` defaults to `auth.user_id()`, the app never sends `user_id` in a request body at all — Postgres fills it in from the caller's authenticated identity, and the four policies above are the only thing that decides which rows that caller can touch.

This is enforced **independently of the application code** — `lib/server/contacts.repository.ts` doesn't filter by `user_id` anywhere, because it doesn't need to: the database itself won't return or accept rows that don't belong to the caller, even if a future code change forgets an ownership check.

## Testing

```bash
npm test
```

Runs [`__tests__/contact.validation.test.ts`](__tests__/contact.validation.test.ts) against [`lib/validation/contact.validation.ts`](lib/validation/contact.validation.ts) — the same pure function the API routes call before touching the database. It verifies:

- an empty name is rejected
- a whitespace-only name is rejected
- an invalid `priority` value (e.g. `"urgent"`) is rejected
- an invalid `next_follow_up_date` is rejected
- valid input is accepted, both with only required fields and with every field populated

No database connection or live Neon project is needed to run this — it's a pure-function unit test.

**Test output:**

```
TODO — paste the real `npm test` output here, e.g.:

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
```

## Deployment

1. Push this repository to a new **public** GitHub repo.
2. In the [Neon console](https://console.neon.tech): create a project, enable **Managed Better Auth** and the **Data API**, then run [`db/schema.sql`](db/schema.sql) followed by [`db/rls_policies.sql`](db/rls_policies.sql) against it (Neon's SQL editor, or `psql "$DATABASE_URL" -f db/schema.sql && psql "$DATABASE_URL" -f db/rls_policies.sql`).
3. Import the GitHub repo into [Vercel](https://vercel.com/new).
4. In the Vercel project's **Settings → Environment Variables**, add all five variables listed above (real values this time — Vercel's own env var storage, not committed to git).
5. Deploy. Then in the Neon console, add your `*.vercel.app` production domain to Neon Auth's trusted origins so sign-in works there.
6. Open the deployed URL in a private/incognito window and run through the checklist below.

## Known limitations and what's next

- The exact Better Auth server method used to mint the Data API's bearer JWT (`auth.token()` in `lib/server/data-client.ts`) was chosen from `@neondatabase/neon-js`'s type definitions and the fact that it's the SDK's JWT-plugin endpoint (the shape the PostgREST Data API expects) — `@neondatabase/neon-js` is a beta package, so this is the one integration point worth re-checking against the quickstart snippet Neon's own dashboard generates once Managed Better Auth + the Data API are enabled on your project, and adjusting if the dashboard suggests a different method name.
- No pagination — the contact list loads everything for the signed-in user in one request. Fine at personal scale, would need pagination for very large lists.
- No CSV import/export or reminder emails for upcoming follow-ups yet.
- No password reset flow.
- No optimistic UI updates — every action re-fetches the list after it completes.

## Project structure

```
networking-tracker/
├── db/                        # SQL migrations: schema + RLS policies
├── lib/
│   ├── server/                # backend-only: auth, Data API client, repository, session check
│   ├── validation/            # pure validation function (Jest-tested)
│   ├── types/                 # shared TypeScript types
│   └── auth-client.ts         # client-safe Better Auth client
├── app/
│   ├── (auth)/sign-in, sign-up
│   ├── contacts/              # list, new, [id]/edit pages
│   ├── api/                   # backend route handlers (auth + contacts)
│   └── components/            # frontend components (contacts UI, layout)
├── proxy.ts                   # route protection (Next.js 16's renamed middleware.ts)
└── __tests__/                 # Jest suite
```
