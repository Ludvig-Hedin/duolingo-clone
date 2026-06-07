# Swedish ↔ Polish courses + Vercel deployment

## 1. What was added (feature)

The app's data model treats a **course** as a target language; the **question**
text is written in the language the learner already knows (the "from" language)
and the **answer options** are in the language being learned (the "to" language).
No application code needs to change to add a language pair — courses are read
generically from the database via `getCourses()` and rendered by
`app/(main)/courses/list.tsx`.

Two directional courses were added to the seed (`scripts/prod.ts`):

| Course | From (question) | To (answers) | Flag |
| --- | --- | --- | --- |
| `Swedish → Polish` | Swedish | Polish | `/pl.svg` |
| `Polish → Swedish` | Polish | Swedish | `/se.svg` |

The existing `Spanish` course is preserved. The flag shown on each course card
is the **target** language (what you are learning), matching Duolingo's
convention; the direction is made explicit in the course title.

### Vocabulary

Each course teaches the same six illustrated nouns (images are shared and
language-neutral): man, woman, boy, girl, zombie, robot.

| Image | Swedish (definite) | Polish |
| --- | --- | --- |
| man | mannen | mężczyzna |
| woman | kvinnan | kobieta |
| boy | pojken | chłopiec |
| girl | flickan | dziewczynka |
| zombie | zombien | zombie |
| robot | roboten | robot |

`Swedish → Polish` prompts read `Vilken av dessa är "<swedish>"?`;
`Polish → Swedish` prompts read `Który z nich to "<polish>"?`. `ASSIST`
challenges show the source word in quotes. No audio assets exist for Swedish or
Polish, so `audioSrc` is omitted for those courses (the player handles a missing
source silently — see `app/lesson/card.tsx`).

### New files

- `public/pl.svg` — Poland flag (white / red).
- `public/se.svg` — Sweden flag (blue field, yellow Scandinavian cross).

### Changed files

- `scripts/prod.ts` — rewritten data-driven; seeds all three courses from a
  `COURSES` table instead of hardcoded Spanish-only inserts.

### Re-seeding the database

The seed **wipes and recreates** all course/unit/lesson/challenge data (it does
not touch Clerk users; it does clear `user_progress`). Run:

```bash
bun run db:push   # apply schema (no schema change here, but safe to run)
bun run db:prod   # seed Spanish, Swedish → Polish, Polish → Swedish
```

`db:prod` requires `DATABASE_URL` in the environment (`.env`).

---

## 2. Deploying to Vercel (new project)

This app needs three external services. All have free tiers. The build **fails**
without a valid Clerk publishable key, and the app is non-functional without a
Neon database, so these two are mandatory; Stripe is only needed for the
shop/premium tier and can start as a placeholder.

### Required environment variables

| Variable | Source | Needed for |
| --- | --- | --- |
| `DATABASE_URL` | Neon (Postgres) | all data; app is non-functional without it |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk | **build** + auth (must be a real key) |
| `CLERK_SECRET_KEY` | Clerk | auth |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | static | `"/sign-in"` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | static | `"/sign-up"` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | static | `"/"` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | static | `"/"` |
| `CLERK_ADMIN_IDS` | Clerk user id(s) | `/admin` (set to your Clerk user id) |
| `STRIPE_API_SECRET_KEY` | Stripe | shop/subscription (placeholder OK to start) |
| `STRIPE_WEBHOOK_SECRET` | Stripe | webhook (placeholder OK to start) |
| `NEXT_PUBLIC_APP_URL` | your prod URL | checkout return URLs, metadata |

> The driver is `@neondatabase/serverless`, which speaks Neon's protocol — the
> database must be **Neon** (e.g. via the Vercel Marketplace → Neon, or
> neon.tech directly). A generic Postgres URL will not work.

### Quick path (one command)

The Vercel project is already created and linked. Once you have the credentials
above, run the helper script — it sets every env var, deploys, repoints
`NEXT_PUBLIC_APP_URL` at the real URL, redeploys, and seeds the database:

```bash
bash scripts/finish-deploy.sh
```

It prompts for `DATABASE_URL`, the Clerk keys, and (optionally) Stripe; secret
inputs are read without echoing. Prefer the manual flow below if you'd rather do
each step yourself.

### Step-by-step

1. **Neon DB** — create a project at the Vercel Marketplace (Storage → Neon) or
   neon.tech. Copy the pooled connection string (`...sslmode=require`).
2. **Clerk app** — create an application at dashboard.clerk.com. Copy the
   Publishable key (`pk_test_…`) and Secret key (`sk_test_…`). Your Clerk user
   id (`user_…`, from the Users tab) goes in `CLERK_ADMIN_IDS`.
3. **Stripe (optional now)** — dashboard.stripe.com → Developers → API keys for
   the secret key; set up the webhook later pointing at
   `https://<your-domain>/api/webhooks/stripe`.
4. **Create the Vercel project** (CLI, from the repo root):
   ```bash
   vercel link                # create/link a new project
   # add each variable to production:
   vercel env add DATABASE_URL production
   vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY production
   vercel env add CLERK_SECRET_KEY production
   vercel env add CLERK_ADMIN_IDS production
   vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_URL production       # /sign-in
   vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_URL production       # /sign-up
   vercel env add NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL production   # /
   vercel env add NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL production   # /
   vercel env add STRIPE_API_SECRET_KEY production              # placeholder ok
   vercel env add STRIPE_WEBHOOK_SECRET production              # placeholder ok
   vercel env add NEXT_PUBLIC_APP_URL production                # https://<domain>
   ```
5. **Deploy**:
   ```bash
   vercel deploy --prod
   ```
6. **Seed the production DB** (locally, with the same `DATABASE_URL` in `.env`):
   ```bash
   bun run db:push && bun run db:prod
   ```
7. **Set `NEXT_PUBLIC_APP_URL`** to the real deployment URL (and update the
   Stripe webhook endpoint) once the domain is known, then redeploy.

### Notes / gotchas

- `vercel.ts` contains an `ignoreCommand` that skips the build when a push only
  touches docs/license/`.env.example`/`.github`/`.vscode`. Code/seed/public
  changes always build.
- Git-integration deploys (push to the connected GitHub repo) are the simplest
  ongoing flow; `vercel deploy --prod` from the CLI also works.
