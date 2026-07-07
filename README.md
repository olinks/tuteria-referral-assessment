# Tuteria Referral Follow-up — Case Study

A **Next.js + Supabase (BaaS) + Resend** implementation of the referral
follow-up email flow described in the case study, with a **GitHub Actions**
pipeline that runs automated tests and deploys to **Vercel** on PR merge.

## What it does

The original assessment provides pseudo-code that, given a referrer (`user`)
and a referral `lead` (referred user + course + reward), composes an email
context and calls `post_to_cdn_postmark_service("/send-mail", {...})`.

This project reimplements that faithfully:

| Original snippet | This project |
|---|---|
| `post_to_cdn_postmark_service("/send-mail", payload)` | [`src/lib/mailService.ts`](src/lib/mailService.ts) — same name & signature, routed through Resend |
| `context` object (first name, referred user, course, currency, reward, tracking URL, recipient) | [`src/lib/referral.ts`](src/lib/referral.ts) — assembled identically |
| `template: "medbuddy_referral_followup"` | [`src/lib/templates.ts`](src/lib/templates.ts) — rendered inline |
| `settings.WEBSITE_URL`, `settings.CDN_SERVICE` | [`src/lib/settings.ts`](src/lib/settings.ts) |

- **UI** (`/`): lists referral leads from Supabase; each has a **Send referral
  email** button.
- **Backend endpoints**:
  - `GET /api/leads` — lists leads with referrer + referred user + course.
  - `POST /api/referral/send` — loads records from Supabase and dispatches the
    email (the snippet's action).
- **Graceful degradation**: if the email provider can't deliver (e.g. an
  unverified recipient on a brand-new account, or no API key in CI), the API
  returns the fully rendered email as a **preview** instead of hard-failing —
  so the demo always works.

## Tech stack

- **Next.js 14** (App Router) — UI + API routes
- **Supabase** — Postgres BaaS (`@supabase/supabase-js`)
- **Resend** — transactional email
- **Vitest** — automated tests
- **Vercel** — production hosting
- **GitHub Actions** — CI/CD

## Local setup

```bash
npm install
cp .env.example .env.local   # fill in your Supabase + Resend values
```

Apply the database schema + seed: open
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) in the
Supabase SQL editor and run it. This creates `users`, `courses`, `leads` and
seeds demo data.

```bash
npm run dev     # http://localhost:3000
npm test        # run the test suite
npm run build   # production build / type-check
```

## Environment variables

| Variable | Where | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | client + server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | client + server | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | server-side reads (bypasses RLS) |
| `RESEND_API_KEY` | server only | email transport (omit → preview mode) |
| `MAIL_FROM` | server | verified sender, e.g. `Medbuddy <onboarding@resend.dev>` |
| `NEXT_PUBLIC_WEBSITE_URL` | app | base for the referral tracking link |

## Deployment (Vercel) — one-time

1. Import the repo into Vercel; set the env vars above in the project settings.
2. Create a Vercel token and grab your Org/Project IDs
   (`vercel link` produces `.vercel/project.json`).
3. In the GitHub repo, add these **Actions secrets**:
   - `VERCEL_TOKEN`
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
     `NEXT_PUBLIC_WEBSITE_URL` (used by the build step)

## CI/CD — how the requirement is met

[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):

- On **every pull request** → `test` job runs `npm test` then `npm run build`
  (**the bonus**: automated tests run before any deploy).
- On **push to `main`** (i.e. when a PR is merged) → `deploy` job runs, gated on
  `needs: test`, and deploys to Vercel **production**.

Because deploy is `if: github.event_name == 'push' && github.ref == 'refs/heads/main'`
and depends on `test`, a merge is what triggers production deployment, exactly
as specified.

## Demonstrating the PR → Action → Deploy flow

```bash
git checkout -b feature/referral-flow
git add . && git commit -m "Add referral follow-up flow"
git push -u origin feature/referral-flow
# Open a PR against main → the test job runs on the PR.
# Merge the PR → the deploy job runs and ships to production.
```

The merged PR + green Actions run is the artifact the reviewer looks for.

## Deliverables checklist

- [x] Next.js app leveraging a BaaS (Supabase) + the pseudo-code logic
- [x] UI + backend endpoints performing the referral action
- [x] GitHub Action that deploys on PR merge
- [x] Bonus: automated tests run before the deploy step
- [ ] Source repo URL — _add after pushing to GitHub_
- [ ] Production URL — _add after first Vercel deploy_
- [ ] A real merged PR showing the Action succeed
