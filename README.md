# WellnessHub

A full-stack wellness and travel planning platform. Plan trips with health in mind, track daily wellness logs, record health metrics, and manage your profile — all in one place.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Quick Start with Docker Compose](#quick-start-with-docker-compose)
  - [Manual Setup](#manual-setup)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

WellnessHub connects wellness-focused travel planning with personal health tracking. Users can plan trips, log daily wellness activities (mood, sleep, exercise, meditation, nutrition), record health metrics (heart rate, blood pressure, weight, steps, water intake), and configure personal preferences — with security features like two-factor authentication built in.

---

## Features

- **Authentication** — Registration and login with JWT tokens, PBKDF2 password hashing, rate limiting, and optional two-factor authentication (TOTP)
- **Trip Management** — Create, update, and delete trips with destination, dates, budget, and status tracking
- **Trip Activities** — Schedule and track activities within a trip (wellness, sightseeing, dining, transport, accommodation)
- **Wellness Logs** — Log mood, sleep, exercise, meditation, nutrition, symptoms, and vitals with ratings and duration
- **Health Metrics** — Record and query heart rate, blood pressure, weight, steps, and water intake over time
- **User Profile & Settings** — Manage profile details, theme, language, unit preferences, and notification settings

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend runtime | [Cloudflare Workers](https://workers.cloudflare.com/) |
| Backend framework | [Hono](https://hono.dev/) |
| Database | [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite) |
| ORM | [Drizzle ORM](https://orm.drizzle.team/) |
| Validation | [Zod](https://zod.dev/) |
| 2FA | [OTPLib](https://github.com/yeojz/otplib) |
| Frontend framework | [Next.js](https://nextjs.org/) (React 19) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Animations | [Framer Motion](https://www.framer.com/motion/) |
| UI primitives | [Radix UI](https://www.radix-ui.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| Language | TypeScript (throughout) |
| CI/CD | GitHub Actions |
| Frontend hosting | [Vercel](https://vercel.com/) |

---

## Project Structure

```
WellnessHub/
├── backend/                    # Cloudflare Workers API (Hono + Drizzle)
│   ├── src/
│   │   ├── index.ts            # Main application entry point & route handlers
│   │   ├── schemas.ts          # Zod request/response validation schemas
│   │   ├── auth-utils.ts       # Password hashing, JWT helpers
│   │   ├── utils.ts            # Shared utility functions
│   │   └── db/
│   │       └── schema.ts       # Drizzle ORM database schema
│   ├── drizzle/                # SQL migration files
│   ├── test/                   # Unit tests
│   ├── wrangler.jsonc          # Cloudflare Workers configuration
│   └── README.md               # Backend-specific setup guide
│
├── frontend/                   # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/         # Login and register pages
│   │   │   └── dashboard/      # Protected pages (trips, health, settings…)
│   │   ├── components/         # UI, shared, and section components
│   │   ├── context/            # React context (auth state)
│   │   ├── hooks/              # Custom React hooks
│   │   └── lib/                # API client, token storage, validation helpers
│   ├── .env.example
│   └── README.md               # Frontend-specific setup guide
│
├── wellness-travel-hub/        # Standalone UI design artifacts (HTML/CSS)
├── .github/workflows/          # CI and deployment pipelines
├── docker-compose.yml          # Local development orchestration
├── nginx.conf                  # Optional reverse proxy configuration
├── DEPLOYMENT.md               # Detailed deployment instructions
└── .env.example                # Root environment variable template
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/) (for the Docker path)
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) with Workers and D1 enabled (for deployment)

### Quick Start with Docker Compose

The fastest way to run the full stack locally:

```bash
# 1. Clone the repository
git clone https://github.com/johan-droid/WellnessHub.git
cd WellnessHub

# 2. Copy the environment template
cp .env.example .env.local

# 3. Start all services
docker compose up -d
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8787 |

```bash
# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Manual Setup

#### Backend

```bash
cd backend

# Copy secrets template
cp .dev.vars.example .dev.vars
# Edit .dev.vars and set JWT_SECRET (see Environment Variables section)

# Install dependencies
npm ci

# Apply local database migrations
npm run migrate:local

# Start the development server (http://localhost:8787)
npm run dev
```

#### Frontend

```bash
cd frontend

# Copy environment template
cp .env.example .env.local
# Edit .env.local and set NEXT_PUBLIC_API_URL=http://localhost:8787

# Install dependencies
npm ci

# Start the development server (http://localhost:3000)
npm run dev
```

---

## Environment Variables

### Backend (`backend/.dev.vars`)

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | ✅ | Secret key for signing JWTs (min 32 characters). Generate with `openssl rand -hex 32` |
| `JWT_EXPIRY` | | JWT expiry duration (default: `24h`) |
| `REFRESH_TOKEN_EXPIRY` | | Refresh token expiry (default: `7d`) |
| `CORS_ORIGINS` | | Comma-separated allowed origins (default: `http://localhost:3000`) |
| `ENVIRONMENT` | | Runtime environment (`development` / `production`) |
| `OTP_WINDOW` | | TOTP validation window in steps (default: `1`) |
| `OTP_STEP` | | TOTP step duration in seconds (default: `30`) |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend base URL (e.g. `http://localhost:8787`) |
| `NEXT_PUBLIC_ENVIRONMENT` | | Environment label (default: `development`) |
| `NEXT_PUBLIC_ENABLE_2FA` | | Enable 2FA UI flows (default: `true`) |
| `NEXT_PUBLIC_ENABLE_ERROR_TRACKING` | | Enable client-side error tracking (default: `false`) |

---

## API Overview

The backend exposes a REST API at `http://localhost:8787`. A full reference with curl examples is available in [`backend/API-Testing-Guide.md`](backend/API-Testing-Guide.md).

### Public Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive a JWT |

### Protected Endpoints (require `Authorization: Bearer <token>`)

| Resource | Methods | Base Path |
|---|---|---|
| Current user | `GET`, `PUT` | `/api/protected/me` |
| Password | `POST` | `/api/protected/auth/change-password` |
| Two-factor auth | `POST`, `DELETE` | `/api/protected/auth/2fa` |
| App settings | `GET`, `PUT` | `/api/protected/settings` |
| Trips | `GET`, `POST`, `PUT`, `DELETE` | `/api/protected/trips` |
| Trip activities | `GET`, `POST`, `PUT`, `DELETE` | `/api/protected/trips/:id/activities` |
| Wellness logs | `GET`, `POST`, `DELETE` | `/api/protected/wellness-logs` |
| Health metrics | `GET`, `POST` | `/api/protected/health-metrics` |

---

## Database Schema

The backend uses Cloudflare D1 (SQLite) managed through Drizzle ORM. Key tables:

| Table | Purpose |
|---|---|
| `users` | Account credentials and profile data |
| `trips` | Trip records (destination, dates, budget, status) |
| `trip_activities` | Scheduled activities within a trip |
| `wellness_logs` | Daily wellness entries (mood, sleep, exercise…) |
| `health_metrics` | Quantitative health measurements |
| `app_settings` | Per-user UI and notification preferences |
| `two_factor_auth` | TOTP secrets and backup codes |

Migration files live in `backend/drizzle/`. Apply them with:

```bash
# Local
npm run migrate:local   # from backend/

# Production
npm run migrate:prod    # from backend/
```

---

## Testing

```bash
# Backend unit tests
cd backend
npm run test

# Backend type checking
npm run lint

# Frontend linting
cd frontend
npm run lint

# Frontend production build (also validates types)
npm run build
```

---

## Deployment

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for the complete step-by-step guide. A summary:

### Backend → Cloudflare Workers

```bash
cd backend

# Set production secrets (first deploy only)
wrangler secret put JWT_SECRET --env production

# Deploy
npm run deploy
```

### Frontend → Vercel

1. Connect your GitHub repository to a [Vercel project](https://vercel.com/new).
2. Set `NEXT_PUBLIC_API_URL` to your Cloudflare Workers domain in Vercel Project Settings.
3. Push to `main` — GitHub Actions deploys automatically via `.github/workflows/deploy.yml`.

### CI/CD

| Workflow file | Trigger | Actions |
|---|---|---|
| `.github/workflows/ci.yml` | Push / Pull Request | Lint, type-check, unit tests |
| `.github/workflows/deploy.yml` | Push to `main` | Apply D1 migrations, deploy backend + frontend |

---

## Contributing

1. Fork the repository and create a feature branch (`git checkout -b feature/my-feature`).
2. Make your changes and ensure tests and linting pass.
3. Open a pull request against `main`.

---

## License

This project is open source. See the repository for license details.
