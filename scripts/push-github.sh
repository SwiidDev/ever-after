#!/usr/bin/env bash
# Push ~/weddo/app to a fresh or existing GitHub repo.
#
# Auth via ONE of:
#   - GH_TOKEN (classic ghp_… or fine-grained github_pat_… with `repo`)
#   - `gh auth login` already completed
#
# Run this script in any terminal where Hermes isn't blocking you, e.g.:
#   GH_TOKEN=ghp_… bash scripts/push-github.sh
set -e

cd "$(dirname "$0")/.."
NAME=${NAME:-ever-after}
VISIBILITY=${VISIBILITY:-private}

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "not a git repo: $PWD" >&2; exit 1
fi

# local config (idempotent)
git config --get user.name  >/dev/null  || git config user.name  "Jacques Wud"
git config --get user.email >/dev/null || git config user.email "jacqueswud86@gmail.com"
current_branch=$(git branch --show-current)
[ -z "$current_branch" ] && { git checkout -b main; current_branch=main; }
[ "$current_branch" = "master" ] && git branch -m main

# create or reuse the remote repo via GitHub API (idempotent: 422 is fine)
create_repo() {
  if [ -n "$GH_TOKEN" ]; then
    curl -sS -H "Authorization: Bearer $GH_TOKEN" \
      -H "Accept: application/vnd.github+json" \
      -X POST https://api.github.com/user/repos \
      -d "{\"name\":\"$NAME\",\"private\":$( [ "$VISIBILITY" = "public" ] && echo false || echo true ),\"auto_init\":false}"
    # a 422 "already exists" is fine
  else
    gh repo create "$OWNER/$NAME" --$VISIBILITY --source=. --remote=origin --push=false
  fi
}

OWNER=$( ( [ -n "$GH_TOKEN" ] && curl -sS -H "Authorization: Bearer $GH_TOKEN" https://api.github.com/user | grep '"login"' | head -1 | sed -E 's/.*"login": *"?([^"]+)"?.*/\1/' ) \
       || gh api user --jq .login )

echo "Creating repo github.com/$OWNER/$NAME ($VISIBILITY)…"
create_repo >/dev/null

git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$OWNER/$NAME.git"

echo "Pushing main → origin…"
if [ -n "$GH_TOKEN" ]; then
  # use token in URL for push (no extra config)
  git push -u "https://${GH_TOKEN}@github.com/$OWNER/$NAME.git" main
else
  gh repo sync 2>/dev/null || git push -u origin main
fi

cat <<EOF

✅  https://github.com/$OWNER/$NAME

Next steps:
  1) Add env vars in Vercel → Settings → Environment Variables for ever-after
       DATABASE_URL       from your .env (Neon)
       AUTH_SECRET       any 32-byte hex (openssl rand -hex 32)
       AI_BASE_URL       https://inference-api.nousresearch.com/v1
       AI_API_KEY        your Nous key
       AI_MODEL          qwen/qwen3.8-flash
  2) In Vercel → Connect Project → pick this repo → Production branch main
  3) It deploys ~60s; you'll get a https://ever-after.vercel.app URL
EOF
