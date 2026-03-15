# Frontend (Next.js)

## Local development

1. Copy environment template:

```bash
cp .env.example .env.local
```

2. Install dependencies and run:

```bash
npm ci
npm run dev
```

The app runs on http://localhost:3000.

## Required environment variables

- NEXT_PUBLIC_API_URL: Backend base URL (example: http://localhost:8787)

## Build and lint

```bash
npm run lint
npm run build
```

## Vercel deployment

Set this environment variable in Vercel Project Settings:

- NEXT_PUBLIC_API_URL=https://<your-cloudflare-worker-domain>

`frontend/vercel.json` includes hardened security headers. CI/CD deployment uses the root GitHub Actions workflow files:

- .github/workflows/ci.yml
- .github/workflows/deploy.yml
