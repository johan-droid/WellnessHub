# Backend (Hono on Cloudflare Workers)

## Local development

1. Copy local secrets template:

```bash
cp .dev.vars.example .dev.vars
```

2. Install and run:

```bash
npm ci
npm run dev
```

The API runs locally on http://localhost:8787.

## Key local variables (.dev.vars)

- JWT_SECRET: Required for auth token signing/verification
- CORS_ORIGINS: Comma-separated allowed frontend origins
- ENVIRONMENT: development

## Type check and tests

```bash
npm run lint
npm run test
```

## Database migrations (D1)

Apply locally:

```bash
npm run migrate:local
```

Apply to production D1:

```bash
npm run migrate:prod
```

## Production deployment (Cloudflare Workers)

```bash
npm run deploy
```

Before first deploy, set production secrets/vars with Wrangler:

```bash
wrangler secret put JWT_SECRET --env production
wrangler deploy --env production
```

The root CI/CD workflow also applies D1 migrations and deploys from GitHub Actions.
