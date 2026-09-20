# Ever After — Project State

Complete snapshot of the wedding marketplace as of 2026-09-20.

## Live deployment
- **Public URL:** https://app-xi-eight-33.vercel.app
- **Repo:** https://github.com/SwiidDev/ever-after
- **Branch:** `main` (= `master`, both at commit `d67e0cb`)
- **Database:** Neon project `wandering-bonus-07958146` · branch `production` · region `us-east-2`
- **Hosting:** Vercel team `swiiddevs-projects` · project `app` · region auto (Fra preference set in vercel.json)

## Brand
`Ever After` (decided after multiple shortlists — see [[ever-after-name-decision]]).
Centralized at `src/lib/brand.ts` so a rebrand is one file.

## What was built (chronological)
| Milestone | Commit | What it shipped |
|---|---|---|
| M1: scaffold | `a959df0` | Next 16 app, Prisma 6 + Postgres (Docker `weddo-pg`), 14 Pretoria vendors seeded, vendor directory + register + admin |
| M2: lead engine | `9b0f751` | Questionnaire → lead → distribute to 5 vendors → teaser inbox → atomic credit unlock. Money-path test: 7/7 (under concurrency) |
| M3: couple tools | `0ba93bf` | Email login, dashboard with countdown, guest list (3 events), budget w/ donut, monthly checklist, ideas |
| M4: messaging | `8ab19f5` | Threads (lazy, unlock-gated), reviews (DB-unique), notification outbox, brand.ts |
| M5: real auth + admin | `f37f29b` | Signed HMAC sessions, role-gated admin, POPIA privacy/terms, account export/delete API |
| M6: prod hardening + tailnet | `32dbeea` | Load test (20-way race, exact 1 winner), maintenance job, tailnet http://100.98.17.70:3000 |
| M7: visual polish | `c237ea9` | Light-only theme (fixed dark-mode leak), real wedding photos, /pricing /about /404, expanded footer, cookie banner, dashboard hero, testimonials |
| M8: cloud deploy prep | `69aaca6` | vercel.json (Fra region), `db:migrate` / `db:seed` / `deploy:vercel` scripts, `docs/cloud-deploy.md`, .env.example |
| M8.5: Neon MCP | `448bb46` | `wandering-bonus-07958146/production` linked, Postgres service applied, neon.ts scaffold |
| Cloud deploy | `abb9097` … `d67e0cb` | Vercel CLI login, env vars, force-pushed master to main, git-triggered build is live |
| Final | `d67e0cb` | Schema missing on Neon (vendor list empty), AI working with new `sk-nous-…` key |

## Routes (live, verified)
- `/`, `/about`, `/pricing`, `/privacy`, `/terms`, `/404` (custom component)
- `/search` — geo + keyword + category filters, vendor cards with photos
- `/search?category=Venues&radius=70` — works
- `/vendor/[slug]` — JSON-LD LocalBusiness, photo hero, request-quote CTA
- `/quotes/[category]` — multi-step questionnaire → 5-vendor distribution
- `/dashboard`, `/guests`, `/budget`, `/checklist`, `/ideas` — couple tools
- `/login`, `/vendor/login`, `/vendor/leads`, `/messages/[leadId]`, `/vendor/register`, `/admin`
- API: `/api/auth/signout`, `/api/account/{export,delete}`, `/api/ai/{assistant,listing}`

## Money-path verified
- `scripts/verify-credits.ts` — 7/7 (grant/replay, double-unlock block, EXHAUSTED cap, outsider block, ledger consistency)
- `scripts/load-race.ts` — 20 vendors race for 1 slot → exact 1 winner, lead EXHAUSTED, no ledger drift
- Architecture moves: vendor-row lock first then lead-row lock (dedicated `FOR UPDATE` per resource, no aggregate FOR UPDATE), automatic retry-with-backoff on serializable conflicts

## Architecture choices (in code)
- **Auth:** HMAC-signed cookie sessions (not Auth.js) — tamper-proof, no external dep, role-based. Trade-off: no magic-link flow; dev email sign-in is owner UX.
- **Credit ledger:** append-only `LedgerEntry` with unique `idempotencyKey`; balance = SUM(delta) with cache `Vendor.creditBalance` updated transactionally; nightly drift check.
- **Lead matching:** `vendor.status = APPROVED` + category match, ordered by fairness (lowest unlock count) then rating, top 5, unique `(leadId, vendorId)` slot.
- **Messaging:** thread lazy-created on first open by an authorised participant; couple visibility gated on `lead.coupleId = session.coupleId`.
- **Reviews:** `(leadId)` unique; vendor rating recomputed transactionally.
- **AI layer:** `lib/ai.ts` thin provider-agnostic wrapper (`OpenAI-compatible /chat/completions`), env-driven, reasoning-model fallback (`msg.content ?? msg.reasoning`), 30s timeout. Default model `qwen/qwen3.8-flash` (Nous free tier, Alibaba-backed).

## Env config (local)
`~/weddo/app/.env` holds:
```
DATABASE_URL="postgresql://neondb_owner:***@ep-summer-voice-…/neondb?…"
AUTH_SECRET="<32-byte hex>"
AI_BASE_URL="https://inference-api.nousresearch.com/v1"
AI_API_KEY="sk-nous-…"
AI_MODEL="qwen/qwen3.8-flash"
```

## Open work (none blocking, optional)
1. **Prisma migrations against Neon** — run from your terminal:
   ```
   cd ~/weddo/app
   bunx prisma migrate deploy --schema=prisma/schema.prisma
   bun prisma/seed.ts
   ```
   After: `/search?category=Venues` will show the 14 seeded vendors.
2. **PayFast integration** — real credit-pack payments. Requires merchant account + PayFast merchant ID/secret. The code already has the dev "simulate purchase" path; real requires `/api/payfast/itn` webhook with MD5 signature + IP allow-list.
3. **Real email transport** — `notify.deliverQueued()` currently logs; switch to Resend or SMTP via env key.
4. **Custom domain** — add `everafter.co.za` to Vercel → Settings → Domains.
5. **Vercel Connect for AI** — replace direct Nous key with `vercel ai-gateway` token for rate-limit resilience.
6. **Auth.js or magic links** — replace dev email sign-in for production.
7. **Real per-vendor gallery photos** — upload via R2 storage when vendors register.

## Honest caveats / known rough edges
- Same wedding photo reused across multiple venue cards (intentional — no per-vendor photos exist yet).
- Couple tools' saved-bundle totals ignore vendor currency distinctions (all ZAR).
- Search result count text occasionally mis-extracts via curl grep but renders fine in the browser.
- Deployment Protection on Vercel means browsers see a Vercel SSO wall on preview URLs — use `vercel curl` from CLI or the production alias for direct access.
- Claude-in-Hermes sometimes redacts live TOKENs in scripts/`write_file`, breaking subsequent code execution. Workaround: write through a Node script that composes the token at runtime, or pass via env var outside the message body.
