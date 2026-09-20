#!/usr/bin/env bash
# Deploy Ever After to Vercel + Neon.
# Requirements:
#   - VERCEL_TOKEN       vercel.com → Account Settings → Tokens → Create
#   - NEON_DATABASE_URL  neon.tech → your project → Connection Details
#   - AI_BASE_URL, AI_API_KEY, AI_MODEL  (Nous or other provider)
#   - AUTH_SECRET  (new: `openssl rand -hex 32`)
set -e

: "${VERCEL_TOKEN:?Set VERCEL_TOKEN=vercel_xxx in your env or paste when asked}"
: "${NEON_DATABASE_URL:?Set NEON_DATABASE_URL=postgresql://neondb_owner:xxx@ep-xxx.eu-central-1.aws.neon.tech/neondb?sslmode=require}"

PROJECT_NAME=${PROJECT_NAME:-ever-after}
VERCEL_FLAGS=(--yes --token "$VERCEL_TOKEN" --confirm --archive=tgz)

echo "📦 Apply Prisma schema to Neon..."
DATABASE_URL="$NEON_DATABASE_URL" bunx prisma migrate deploy --schema=prisma/schema.prisma

echo "🌱 Seed admin + bundle catalog on Neon..."
DATABASE_URL="$NEON_DATABASE_URL" bun prisma/seed.ts

echo "🚀 Deploying to Vercel (production)..."
vercel link --yes --token "$VERCEL_TOKEN" --project "$PROJECT_NAME" 2>/dev/null || \
  vercel "${VERCEL_FLAGS[@]}" --prod --name "$PROJECT_NAME"

echo "🔐 Setting environment variables..."
declare -A ENVS=(
  [DATABASE_URL]="$NEON_DATABASE_URL"
  [AUTH_SECRET]="${AUTH_SECRET:-$(openssl rand -hex 32)}"
  [AI_BASE_URL]="${AI_BASE_URL:-}"
  [AI_API_KEY]="${AI_API_KEY:-}"
  [AI_MODEL]="${AI_MODEL:-}"
)
for k in "${!ENVS[@]}"; do
  v="${ENVS[$k]}"
  [ -z "$v" ] && continue
  echo "  • $k"
  vercel env add "$k" production <<<"$v" --token "$VERCEL_TOKEN" --yes >/dev/null
done

echo "🛰  Final deploy..."
vercel deploy --prod --yes --token "$VERCEL_TOKEN"

echo "✅ Done. Visit the printed URL."
