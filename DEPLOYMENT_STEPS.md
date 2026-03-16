# Deployment steps

This file contains concise commands and notes for deploying the WellnessHub project using Docker Compose (production) or Vercel + Cloudflare Workers.

Docker Compose (production):

1. Build and start services:

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

2. Ensure `ssl/` contains `cert.pem` and `key.pem` when using nginx.

Vercel (frontend) + Cloudflare Workers (backend):

1. Frontend: push to Vercel (ensure `NEXT_PUBLIC_API_URL` points to your worker url).
2. Backend: run `wrangler deploy --env production` (requires Cloudflare credentials).

Common production checklist:
- Set secrets (DB migrations, D1 binding, API keys) in CI and Cloudflare/Vercel.
- Run `wrangler d1 migrations apply wellness-hub-db --env production --remote` after DB is provisioned.
- Monitor logs (`wrangler tail` for workers, container logs for Docker).
