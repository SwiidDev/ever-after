# Ever After — deploy notes (local/tailnet production)
- Production server: `bun run start -- -H 0.0.0.0 -p 3000` from ~/weddo/app
- Reachable on tailnet: http://100.98.17.70:3000 (jw-network.tail1de2d9.ts.net)
- Postgres: docker container `weddo-pg` (newgrp docker to manage)
- Maintenance job (nightly): `bun scripts/maintenance.ts` — purges deleted
  accounts >30d, delivers queued notifications, ledger drift check
- AI: Nous inference API via AI_* env vars; token from Hermes OAuth —
  refresh needed when Hermes rotates it
- Cloud deploy (later): Vercel + Neon; AI_* + AUTH_SECRET + DATABASE_URL
  env vars transfer as-is
