# Cloud deploy (Vercel + Neon)

This repo ships with everything needed to deploy to **Vercel** with a
**Neon** Postgres branch.

## What you need before deploying

1. A [Neon](https://neon.tech) project (free tier is fine). Region
   `eu-central-1` keeps latency low for SA users. Copy the **pooled
   connection** string — it ends with `?sslmode=require`.
2. A [Vercel](https://vercel.com) account. Generate a
   [token](https://vercel.com/account/settings/tokens) (read + write scope).
3. AI provider (Nous / OpenAI / OpenRouter / self-hosted) with
   `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`.

## One-shot deploy

```bash
export VERCEL_TOKEN="vercel_xxx"
export NEON_DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"
export AI_API_KEY="..."          # optional
export AI_BASE_URL="..."         # optional
export AI_MODEL="..."            # optional
export AUTH_SECRET="$(openssl rand -hex 32)"
bash scripts/deploy-vercel.sh
```

What it does:

1. Applies the Prisma schema to Neon (`prisma migrate deploy`).
2. Seeds the admin user + default credit bundles on Neon.
3. Creates / links the Vercel project `ever-after` (Fra region).
4. Adds production env vars (DATABASE_URL, AUTH_SECRET, AI_*).
5. Deploys to production. Prints the assigned `vercel.app` URL.

After the first deploy, push to your connected git remote to redeploy.

## Headless CI (recommended later)

If you push to GitHub, connect the repo once in Vercel and every commit
auto-deploys. Add the same env vars in the Vercel dashboard once; you
never need the CLI token again.

## Production smoke test

```bash
curl -sI $DEPLOY_URL | head -1                        # 200
curl -s  $DEPLOY_URL/search?category=Venues | \
  grep -o "Rustic Rock Venue" | head -1             # seeded vendor
DEPLOY_URL=$DEPLOY_URL bun scripts/maintenance.ts    # ledger check
```
