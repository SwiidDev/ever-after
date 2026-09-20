#!/usr/bin/env bash
# One-shot: push to GitHub, deploy to Vercel, attach Neon DB, register AI
# env vars. Run anywhere you have credentials.
set -e
cd "$(dirname "$0")/.."

: "${VERCEL_TOKEN:?set VERCEL_TOKEN=vercel_... first}"
: "${NEON_DATABASE_URL:?set NEON_DATABASE_URL=postgresql://...neon.../?sslmode=require}"
NAME=${NAME:-ever-after}
VISIBILITY=${VISIBILITY:-private}
PROD_FLAG="--prod"

echo "● 1/5  Push to GitHub (or use existing)"
if [ -n "$REPO" ]; then
  echo "   using existing REPO=$REPO"
elif [ -n "$GH_TOKEN" ] || gh auth status >/dev/null 2>&1; then
  GH_TOKEN="$GH_TOKEN" bash scripts/push-github.sh
  OWNER=$( ( [ -n "$GH_TOKEN" ] && curl -sS -H "Authorization: Bearer $GH_TOKEN" https://api.github.com/user | grep '"login"' | head -1 | sed -E 's/.*"login": *"?([^"]+)"?.*/\1/' ) \
        || gh api user --jq .login )
  REPO="https://github.com/$OWNER/$NAME"
else
  # Skip push: repo already exists at REPO (e.g. user pushed manually)
  REPO=$GITHUB_OWNER/$NAME
  [ -z "$REPO" ] && { echo "Set REPO=git@github.com:OWNER/$NAME.git or GH_TOKEN to push"; exit 1; }
fi
echo "   → $REPO"

echo "● 2/5  Apply Prisma schema to Neon"
DATABASE_URL="$NEON_DATABASE_URL" bunx prisma migrate deploy --schema=prisma/schema.prisma
DATABASE_URL="$NEON_DATABASE_URL" bun prisma/seed.ts

echo "● 3/5  Create Vercel project from GitHub"
# First-time: `vercel link` against an existing project (created in dashboard)
# or fresh: `vercel` mints a new project. Either way, ensure Git is connected.
vercel link --yes --token "$VERCEL_TOKEN" --repo "$REPO" 2>/dev/null || \
  vercel "$PROD_FLAG" --yes --token "$VERCEL_TOKEN" --confirm --name "$NAME"

echo "● 4/5  Set environment variables"
declare -A ENVS=(
  [DATABASE_URL]="$NEON_DATABASE_URL"
  [AUTH_SECRET]="${AUTH_SECRET:-$(openssl rand -hex 32)}"
  [AI_BASE_URL]="${AI_BASE_URL:-https://inference-api.nousresearch.com/v1}"
  [AI_API_KEY]="${AI_API_KEY:-}"
  [AI_MODEL]="${AI_MODEL:-qwen/qwen3.8-flash}"
)
for k in "${!ENVS[@]}"; do
  v="${ENVS[$k]}"
  echo "  • $k"
  echo "$v" | vercel env add "$k" production --token "$VERCEL_TOKEN" --yes >/dev/null
done

echo "● 5/5  Deploy to production"
vercel "$PROD_FLAG" --yes --token "$VERCEL_TOKEN" --confirm

cat <<EOF

────────────────────────────────────────────────────────────
✅ Deployed. Find the URL in the output above (e.g.
   https://ever-after.vercel.app).

↪ Smoke test:
   curl -sI "https://ever-after.vercel.app" | head -1        # → HTTP/2 200
   curl -s  "https://ever-after.vercel.app/search?category=Venues" | grep -o "Rustic Rock Venue"
────────────────────────────────────────────────────────────
EOF
