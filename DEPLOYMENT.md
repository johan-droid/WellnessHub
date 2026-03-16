# Environment & Deployment Configuration

This document covers all environment variables, GitHub Actions, and deployment configurations for the Wellness Travel Hub application.

## Table of Contents

- [Environment Variables](#environment-variables)
- [GitHub Actions](#github-actions)
- [Docker Compose](#docker-compose)
- [Deployment](#deployment)
- [Security](#security)

## Environment Variables

### Backend (.dev.vars.example → .dev.vars)

```bash
# Authentication
JWT_SECRET=your-long-random-secret-minimum-32-characters
JWT_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=7d

# CORS & Security
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
SECURE_HEADERS=true

# Environment
ENVIRONMENT=development
NODE_ENV=development

# Database (D1)
DB_NAME=wellbeing-db

# Rate Limiting
RATE_LIMIT_WINDOW=900s
RATE_LIMIT_MAX_REQUESTS=100

# 2FA
OTP_WINDOW=1
OTP_STEP=30
```

**Generate JWT_SECRET:**
```bash
openssl rand -hex 32
```

### Frontend (.env.example → .env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8787
NEXT_PUBLIC_ENVIRONMENT=development
NEXT_PUBLIC_ENABLE_2FA=true
NEXT_PUBLIC_ENABLE_ERROR_TRACKING=false
```

### Root (.env.example → .env.local)

For Docker Compose and deployment configurations.

## GitHub Actions

### Workflows

#### 1. CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

Runs on every push to `main` and `develop` branches, and on pull requests.

**Jobs:**
- **Backend Quality Checks**: Linting, type checking, tests, build
- **Frontend Quality Checks**: Linting, type checking, tests, Next.js build
- **Docker Build & Push**: Builds and pushes Docker images to GHCR
- **Security Scan**: Runs Trivy vulnerability scanner

**Required Secrets:** None (uses GitHub token)

#### 2. Deployment (`.github/workflows/deploy.yml`)

Runs on push to `main` and on workflow dispatch.

**Jobs:**
- **Preflight**: Verifies required secrets are configured
- **Backend Deploy**: Deploys to Cloudflare Workers
- **Frontend Deploy**: Deploys to Vercel
- **Smoke Tests**: Verifies deployments
- **Notifications**: Sends Slack notifications

**Required Secrets:**
```
CLOUDFLARE_API_TOKEN          # From https://dash.cloudflare.com/profile/api-tokens
CLOUDFLARE_ACCOUNT_ID          # From Cloudflare dashboard
CLOUDFLARE_SUBDOMAIN            # Your workers subdomain
VERCEL_TOKEN                     # From https://vercel.com/account/tokens
VERCEL_ORG_ID                    # Your Vercel organization ID
VERCEL_PROJECT_ID                # Your Vercel project ID
VERCEL_APP_DOMAIN                # Your Vercel app domain
SLACK_WEBHOOK_URL (optional)     # For deployment notifications
```

### Setting GitHub Secrets

1. Go to Repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Add each required secret

**Example:**
```
CLOUDFLARE_API_TOKEN: xxx...
VERCEL_TOKEN: xxx...
```

## Docker Compose

### Quick Start

```bash
# Copy environment file
cp .env.example .env.local

# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Services

| Service | Port | Purpose |
|---------|------|---------|
| backend | 8787 | Wrangler dev server |
| frontend | 3000 | Next.js dev server |
| redis | 6379 | Cache (optional) |
| postgres | 5432 | Database (optional) |
| pgadmin | 5050 | DB management (optional) |
| nginx | 80/443 | Reverse proxy (optional) |

### Use Optional Services

```bash
# Include optional services
docker compose --profile optional up -d

# Or start specific services
docker compose up -d postgres pgadmin
```

### Health Checks

```bash
# Check backend health
curl http://localhost:8787/api/health

# Check frontend
curl http://localhost:3000

# Check all services
docker compose ps
```

## Deployment

### Cloudflare Workers (Backend)

**Prerequisites:**
- Wrangler CLI: `npm install -g @cloudflare/wrangler`
- Cloudflare account with API token

**Manual Deployment:**
```bash
cd backend

# Set up environment
cp .dev.vars.example .dev.vars
# Edit .dev.vars with production secrets

# Deploy
wrangler deploy --env production
```

**Automatic (via GitHub Actions):**
- Commit to `main` branch
- Workflow automatically deploys to Cloudflare Workers
- Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` secrets

### Database Migrations (PowerShell)

Run backend SQLite migrations from PowerShell with the exact commands below.

```powershell
Set-Location 'D:/Wellbeing application/backend'
$sqlite = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Links\sqlite3.exe'

# Apply migrations in order
Get-Content drizzle/0000_loose_liz_osborn.sql | & $sqlite database.sqlite
Get-Content drizzle/0001_fix_schema_alignment.sql | & $sqlite database.sqlite
Get-Content drizzle/0002_fix_schema_alignment.sql | & $sqlite database.sqlite

# Verify tables
& $sqlite database.sqlite ".tables"
```

If `sqlite3.exe` is missing, install it once:

```powershell
winget install --id SQLite.SQLite -e --accept-package-agreements --accept-source-agreements
```

### Vercel (Frontend)

**Prerequisites:**
- Vercel account
- Vercel CLI: `npm install -g vercel`

**Manual Deployment:**
```bash
cd frontend
vercel --prod
```

**Automatic (via GitHub Actions):**
- Commit to `main` branch
- Workflow automatically deploys to Vercel
- Requires `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`

### Environment Variables for Production

Update these in respective platforms:

**Cloudflare Workers:**
- `JWT_SECRET` (secure random value)
- `CORS_ORIGINS` (your production domain)
- All other backend env vars

**Vercel:**
- `NEXT_PUBLIC_API_URL` (your production API URL)
- `NEXT_PUBLIC_ENVIRONMENT=production`
- Other frontend env vars

## Security

### Best Practices

1. **Secrets Management**
   - Never commit `.env` files
   - Use `.env.example` for templates
   - Store secrets in GitHub via Settings → Secrets
   - Rotate secrets regularly

2. **CORS Configuration**
   - Whitelist only necessary origins
   - Update after domain changes
   - Different values per environment

3. **JWT Secret**
   - Generate with: `openssl rand -hex 32`
   - Store safely in GitHub Secrets
   - Should be 32+ characters
   - Rotate periodically

4. **HTTPS/SSL**
   - Enable in production
   - Use Let's Encrypt (free)
   - Auto-renew certificates
   - Enforce HTTPS redirects

5. **Rate Limiting**
   - Configure per environment
   - Adjust based on traffic
   - Monitor for abuse

### SSL Certificates

For Nginx reverse proxy:

```bash
# Generate self-signed certificate (dev only)
mkdir -p ssl
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes

# For production, use Let's Encrypt
```

## Troubleshooting

### Backend won't start
```bash
# Check Wrangler version
wrangler --version

# Clear cache and reinstall
rm -rf backend/node_modules
npm ci --prefix backend

# Run in debug mode
cd backend && wrangler dev --local
```

### Frontend build fails
```bash
# Check Node version
node --version  # Should be 18+

# Clear Next.js cache
rm -rf frontend/.next

# Rebuild
npm run build --prefix frontend
```

### Docker Compose issues
```bash
# Stop all containers
docker compose down -v

# Rebuild images
docker compose build --no-cache

# Start fresh
docker compose up -d
```

### GitHub Actions failure
1. Check workflow logs: Actions tab → Select workflow → View logs
2. Verify secrets are set correctly
3. Ensure branch protection rules allow pushes
4. Check API token expiration dates

## References

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Vercel Deployment Documentation](https://vercel.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/actions)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
