<<<<<<< D:/Wellbeing application/README.md
<<<<<<< D:/Wellbeing application/README.md
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=WellnessHub&fontSize=70&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Your%20wellness%20journey%2C%20beautifully%20connected&descAlignY=60&descSize=18" width="100%"/>
</p>

<p align="center">
  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=6EE7B7&center=true&vCenter=true&width=700&lines=🏥+Wellness+%2B+Travel+Planning+Platform;🗺️+Plan+trips+with+health+in+mind;💓+Track+metrics+%26+wellness+logs;🔐+Enterprise-grade+security+with+2FA;☁️+Serverless+%7C+Cloudflare+Workers+%2B+Vercel" alt="Typing SVG" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Hono-E36002?style=for-the-badge&logo=hono&logoColor=white" alt="Hono"/>
  <img src="https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare Workers"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
</p>
=======
<<<<<<< HEAD
# WellnessHub
>>>>>>> D:/Wellbeing application/README.md.undo_before

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

<<<<<<< D:/Wellbeing application/README.md
---

### 🐳 Quick Start with Docker Compose
=======
### Quick Start with Docker Compose
=======
=======
>>>>>>> C:/Users/sahoo/.windsurf/worktrees/Wellbeing application/Wellbeing application-402b65c5/README.md
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=WellnessHub&fontSize=70&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Your%20wellness%20journey%2C%20beautifully%20connected&descAlignY=60&descSize=18" width="100%"/>
</p>

<p align="center">
  <a href="https://git.io/typing-svg">
    <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=6EE7B7&center=true&vCenter=true&width=700&lines=🏥+Wellness+%2B+Travel+Planning+Platform;🗺️+Plan+trips+with+health+in+mind;💓+Track+metrics+%26+wellness+logs;🔐+Enterprise-grade+security+with+2FA;☁️+Serverless+%7C+Cloudflare+Workers+%2B+Vercel" alt="Typing SVG" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Hono-E36002?style=for-the-badge&logo=hono&logoColor=white" alt="Hono"/>
  <img src="https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white" alt="Cloudflare Workers"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=black" alt="Drizzle ORM"/>
  <img src="https://img.shields.io/badge/Zod-3068B7?style=flat-square&logo=zod&logoColor=white" alt="Zod"/>
  <img src="https://img.shields.io/badge/Cloudflare_D1-F38020?style=flat-square&logo=cloudflare&logoColor=white" alt="Cloudflare D1"/>
  <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel"/>
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white" alt="GitHub Actions"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square" alt="PRs Welcome"/>
  <img src="https://img.shields.io/badge/License-Open%20Source-blue?style=flat-square" alt="License"/>
  <img src="https://img.shields.io/badge/Maintained-Yes-green?style=flat-square" alt="Maintained"/>
</p>

---

## 📋 Table of Contents

<details open>
<summary>Click to expand</summary>

- [✨ Overview](#-overview)
- [🚀 Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [⚡ Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [🐳 Quick Start with Docker Compose](#-quick-start-with-docker-compose)
  - [🔧 Manual Setup](#-manual-setup)
- [🔑 Environment Variables](#-environment-variables)
- [🌐 API Reference](#-api-reference)
- [🗄️ Database Schema](#️-database-schema)
- [🧪 Testing](#-testing)
- [🚢 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

</details>

---

## ✨ Overview

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&customColorList=6,11,20&height=3&section=header" width="100%"/>
</p>

**WellnessHub** is a modern, full-stack platform that merges **wellness-focused travel planning** with **personal health tracking**. Whether you're logging daily moods, planning a rejuvenating retreat, or monitoring vital health metrics — WellnessHub keeps it all connected in one elegant experience.

> 🌿 *Plan smarter. Live healthier. Travel with purpose.*

---

## 🚀 Features

<table>
<tr>
<td width="50%">

### 🔐 Authentication & Security
- JWT-based registration & login
- PBKDF2 password hashing (100,000 iterations)
- Time-based Two-Factor Authentication (TOTP)
- Rate limiting on all auth endpoints
- CORS whitelist & secure headers

### 🗺️ Trip Management
- Create, update, and archive trips
- Track destination, dates, status & budget
- `planning` → `ongoing` → `completed` → `archived`

### 🏃 Trip Activities
- Schedule activities within trips
- Categories: wellness · sightseeing · dining · transport · accommodation
- Duration estimates & completion tracking

</td>
<td width="50%">

### 📝 Wellness Logs
- Log: mood · sleep · exercise · meditation · nutrition · symptoms · vitals
- 1–10 rating scale for mood, stress & energy
- Duration tracking & free-form notes

### 💓 Health Metrics
- Record heart rate, blood pressure, weight, steps, water intake
- Query with date range & metric type filters
- Timestamped measurement history

### ⚙️ Profile & Settings
- Update name, bio & avatar
- Theme: light · dark · system
- Language, unit (metric/imperial) & notification preferences
- OAuth integration readiness (Google, Apple)

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<table>
<thead>
<tr>
<th>Layer</th>
<th>Technology</th>
<th>Purpose</th>
</tr>
</thead>
<tbody>
<tr>
<td rowspan="6"><strong>⚙️ Backend</strong></td>
<td><a href="https://workers.cloudflare.com/"><img src="https://img.shields.io/badge/Cloudflare_Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white"/></a></td>
<td>Serverless runtime</td>
</tr>
<tr>
<td><a href="https://hono.dev/"><img src="https://img.shields.io/badge/Hono-E36002?style=flat-square&logo=hono&logoColor=white"/></a></td>
<td>Web framework</td>
</tr>
<tr>
<td><a href="https://developers.cloudflare.com/d1/"><img src="https://img.shields.io/badge/Cloudflare_D1-F38020?style=flat-square&logo=cloudflare&logoColor=white"/></a></td>
<td>Serverless SQLite database</td>
</tr>
<tr>
<td><a href="https://orm.drizzle.team/"><img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=black"/></a></td>
<td>Type-safe ORM & migrations</td>
</tr>
<tr>
<td><a href="https://zod.dev/"><img src="https://img.shields.io/badge/Zod-3068B7?style=flat-square&logo=zod&logoColor=white"/></a></td>
<td>Runtime schema validation</td>
</tr>
<tr>
<td><a href="https://github.com/yeojz/otplib"><img src="https://img.shields.io/badge/OTPLib-6EE7B7?style=flat-square&logoColor=white"/></a></td>
<td>TOTP two-factor auth</td>
</tr>
<tr>
<td rowspan="6"><strong>🎨 Frontend</strong></td>
<td><a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white"/></a></td>
<td>React framework with SSR</td>
</tr>
<tr>
<td><a href="https://react.dev/"><img src="https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black"/></a></td>
<td>UI library</td>
</tr>
<tr>
<td><a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white"/></a></td>
<td>Utility-first styling</td>
</tr>
<tr>
<td><a href="https://www.framer.com/motion/"><img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white"/></a></td>
<td>Animations</td>
</tr>
<tr>
<td><a href="https://www.radix-ui.com/"><img src="https://img.shields.io/badge/Radix_UI-161618?style=flat-square&logo=radix-ui&logoColor=white"/></a></td>
<td>Accessible UI primitives</td>
</tr>
<tr>
<td><a href="https://lucide.dev/"><img src="https://img.shields.io/badge/Lucide_React-F56565?style=flat-square&logoColor=white"/></a></td>
<td>Icon library</td>
</tr>
<tr>
<td rowspan="3"><strong>☁️ Infrastructure</strong></td>
<td><a href="https://www.docker.com/"><img src="https://img.shields.io/badge/Docker_Compose-2496ED?style=flat-square&logo=docker&logoColor=white"/></a></td>
<td>Local dev orchestration</td>
</tr>
<tr>
<td><a href="https://github.com/features/actions"><img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white"/></a></td>
<td>CI/CD pipelines</td>
</tr>
<tr>
<td><a href="https://vercel.com/"><img src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white"/></a></td>
<td>Frontend hosting</td>
</tr>
</tbody>
</table>

---

## 📁 Project Structure

<details>
<summary><strong>Click to expand the full directory tree</strong></summary>

```
WellnessHub/
├── 📂 backend/                     # Cloudflare Workers API
│   ├── 📂 src/
│   │   ├── 📄 index.ts             # Main entry point & all route handlers
│   │   ├── 📄 schemas.ts           # Zod request/response validation schemas
│   │   ├── 📄 auth-utils.ts        # Password hashing, JWT helpers
│   │   ├── 📄 utils.ts             # Shared utility functions
│   │   └── 📂 db/
│   │       └── 📄 schema.ts        # Drizzle ORM table definitions
│   ├── 📂 drizzle/                 # SQL migration files
│   ├── 📂 test/                    # Unit tests
│   ├── 📄 wrangler.jsonc           # Cloudflare Workers config
│   ├── 📄 drizzle.config.ts        # Drizzle migration config
│   ├── 📄 API-Testing-Guide.md     # Full API reference with curl examples
│   └── 📄 README.md                # Backend-specific setup guide
│
├── 📂 frontend/                    # Next.js application
│   ├── 📂 src/
│   │   ├── 📂 app/
│   │   │   ├── 📂 (auth)/          # Login & register pages
│   │   │   └── 📂 dashboard/       # Protected pages
│   │   │       ├── 📂 trips/       # Trip management
│   │   │       ├── 📂 health/      # Health metrics
│   │   │       ├── 📂 daily-wellness/
│   │   │       ├── 📂 profile/
│   │   │       ├── 📂 settings/
│   │   │       └── 📂 2fa/
│   │   ├── 📂 components/
│   │   │   ├── 📂 ui/              # Reusable UI primitives
│   │   │   ├── 📂 shared/          # Navbar, Footer
│   │   │   └── 📂 sections/        # Landing page sections
│   │   ├── 📂 context/             # Global auth state (React context)
│   │   ├── 📂 hooks/               # Custom React hooks
│   │   └── 📂 lib/                 # API client, token storage, validators
│   ├── 📄 .env.example
│   └── 📄 README.md                # Frontend-specific setup guide
│
├── 📂 wellness-travel-hub/         # Standalone UI design artifacts
├── 📂 .github/workflows/           # CI and deploy pipelines
├── 📄 docker-compose.yml           # Local development orchestration
├── 📄 nginx.conf                   # Optional reverse proxy config
├── 📄 DEPLOYMENT.md                # Detailed deployment guide
└── 📄 .env.example                 # Root environment variable template
```

</details>

---

## ⚡ Getting Started

### Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| [Node.js](https://nodejs.org/) | 18+ | Required for both frontend & backend |
| [Docker](https://docs.docker.com/get-docker/) + [Compose](https://docs.docker.com/compose/) | Latest | For the Docker quick-start |
| [Cloudflare account](https://dash.cloudflare.com/sign-up) | — | For production deployment (Workers + D1) |

---

### 🐳 Quick Start with Docker Compose
<<<<<<< D:/Wellbeing application/README.md
>>>>>>> 1d5f3a073c61e84b5f799dd89a7bda440a2be201
>>>>>>> D:/Wellbeing application/README.md.undo_before
=======
>>>>>>> C:/Users/sahoo/.windsurf/worktrees/Wellbeing application/Wellbeing application-402b65c5/README.md

The fastest way to run the full stack locally:

```bash
# 1. Clone the repository
git clone https://github.com/johan-droid/WellnessHub.git
cd WellnessHub

# 2. Copy the root environment template
cp .env.example .env.local

# 3. Start all services
docker compose up -d
```

| 🌐 Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8787 |

```bash
# Stream logs from all services
docker compose logs -f

# Stop and clean up
docker compose down
```

---

### 🔧 Manual Setup

<details>
<summary><strong>Backend (Cloudflare Workers + Hono)</strong></summary>

```bash
cd backend

# 1. Copy the dev secrets template
cp .dev.vars.example .dev.vars
#    → Open .dev.vars and fill in JWT_SECRET (see Environment Variables)

# 2. Install dependencies
npm ci

# 3. Apply local database migrations
npm run migrate:local

# 4. Start the development server
npm run dev
#    → API available at http://localhost:8787
```

</details>

<details>
<summary><strong>Frontend (Next.js)</strong></summary>

```bash
cd frontend

# 1. Copy the environment template
cp .env.example .env.local
#    → Set NEXT_PUBLIC_API_URL=http://localhost:8787

# 2. Install dependencies
npm ci

# 3. Start the development server
npm run dev
#    → App available at http://localhost:3000
```

</details>

---

## 🔑 Environment Variables

<details>
<summary><strong>Backend — <code>backend/.dev.vars</code></strong></summary>

| Variable | Required | Default | Description |
|---|---|---|---|
| `JWT_SECRET` | ✅ | — | JWT signing key (≥ 32 chars). Generate: `openssl rand -hex 32` |
| `JWT_EXPIRY` | | `24h` | Access token expiry duration |
| `REFRESH_TOKEN_EXPIRY` | | `7d` | Refresh token expiry duration |
| `CORS_ORIGINS` | | `http://localhost:3000` | Comma-separated allowed origins |
| `ENVIRONMENT` | | `development` | `development` or `production` |
| `OTP_WINDOW` | | `1` | TOTP validation window (steps) |
| `OTP_STEP` | | `30` | TOTP step duration (seconds) |

</details>

<details>
<summary><strong>Frontend — <code>frontend/.env.local</code></strong></summary>

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | ✅ | — | Backend base URL (e.g. `http://localhost:8787`) |
| `NEXT_PUBLIC_ENVIRONMENT` | | `development` | Environment label |
| `NEXT_PUBLIC_ENABLE_2FA` | | `true` | Enable 2FA UI flows |
| `NEXT_PUBLIC_ENABLE_ERROR_TRACKING` | | `false` | Enable client-side error tracking |

</details>

---

## 🌐 API Reference

> 📖 Full documentation with curl examples: [`backend/API-Testing-Guide.md`](backend/API-Testing-Guide.md)

### Public Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Service health check |
| `POST` | `/api/auth/register` | Create a new account |
| `POST` | `/api/auth/login` | Login and receive a JWT |

### Protected Endpoints

> All protected routes require the `Authorization: Bearer <token>` header.

<details>
<summary><strong>👤 User & Settings</strong></summary>

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/protected/me` | Get current user profile |
| `PUT` | `/api/protected/me` | Update profile (name, bio, avatar) |
| `POST` | `/api/protected/auth/change-password` | Change account password |
| `GET` | `/api/protected/settings` | Get app settings |
| `PUT` | `/api/protected/settings` | Update theme, language, notifications |

</details>

<details>
<summary><strong>🔐 Two-Factor Authentication</strong></summary>

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/protected/auth/2fa/setup` | Initialize TOTP setup (returns QR secret) |
| `POST` | `/api/protected/auth/2fa/verify` | Verify TOTP code and enable 2FA |
| `DELETE` | `/api/protected/auth/2fa` | Disable 2FA |

</details>

<details>
<summary><strong>🗺️ Trips & Activities</strong></summary>

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/protected/trips` | Create a new trip |
| `GET` | `/api/protected/trips` | List all user trips |
| `GET` | `/api/protected/trips/:id` | Get trip details + activities |
| `PUT` | `/api/protected/trips/:id` | Update trip details |
| `DELETE` | `/api/protected/trips/:id` | Delete trip |
| `POST` | `/api/protected/trips/:id/activities` | Add activity to trip |
| `PUT` | `/api/protected/trips/:id/activities/:actId` | Update activity |
| `DELETE` | `/api/protected/trips/:id/activities/:actId` | Delete activity |

</details>

<details>
<summary><strong>📝 Wellness Logs & Health Metrics</strong></summary>

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/protected/wellness-logs` | Create a wellness log entry |
| `GET` | `/api/protected/wellness-logs` | List logs (filter by type, date range) |
| `DELETE` | `/api/protected/wellness-logs/:id` | Delete a log |
| `POST` | `/api/protected/health-metrics` | Record a health metric |
| `GET` | `/api/protected/health-metrics` | List metrics (filter by type, date range) |

</details>

---

## 🗄️ Database Schema

The backend uses **Cloudflare D1** (serverless SQLite) managed via **Drizzle ORM**.

| Table | Key Fields | Purpose |
|---|---|---|
| `users` | `id`, `email`, `passwordHash`, `firstName`, `lastName`, `bio` | Account credentials & profile |
| `trips` | `id`, `userId`, `title`, `destination`, `status`, `budget` | Travel plan records |
| `trip_activities` | `id`, `tripId`, `title`, `category`, `scheduledDate`, `completed` | Per-trip activity schedule |
| `wellness_logs` | `id`, `userId`, `tripId`, `type`, `value`, `rating`, `duration` | Daily wellness entries |
| `health_metrics` | `id`, `userId`, `metricType`, `value`, `unit`, `recordedAt` | Quantitative health data |
| `app_settings` | `id`, `userId`, `theme`, `language`, `units`, `2faEnabled` | Per-user preferences |
| `two_factor_auth` | `id`, `userId`, `secret`, `backupCode`, `enabled` | TOTP secrets & backup codes |

```bash
# Apply migrations locally
cd backend && npm run migrate:local

# Apply migrations to production D1
cd backend && npm run migrate:prod
```

---

## 🧪 Testing

```bash
# ── Backend ──────────────────────────────────
cd backend

npm run test        # Run unit tests
npm run lint        # TypeScript type check

# ── Frontend ─────────────────────────────────
cd frontend

npm run lint        # ESLint
npm run build       # Production build (also validates types)
```

---

## 🚢 Deployment

> 📖 Full step-by-step guide: [`DEPLOYMENT.md`](DEPLOYMENT.md)

### Backend → Cloudflare Workers

```bash
cd backend

# First deploy: set production secrets via Wrangler
wrangler secret put JWT_SECRET --env production

# Deploy
npm run deploy
```

### Frontend → Vercel

1. Connect this repo to a new [Vercel project](https://vercel.com/new)
2. Add environment variable in Vercel Project Settings:
   ```
   NEXT_PUBLIC_API_URL = https://<your-worker>.workers.dev
   ```
3. Push to `main` — CI/CD handles the rest automatically

### CI/CD Pipelines

| Workflow | Trigger | What it does |
|---|---|---|
| `.github/workflows/ci.yml` | Every push & PR | Lint · type-check · unit tests |
| `.github/workflows/deploy.yml` | Push to `main` | D1 migrations → deploy backend → deploy frontend |

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** this repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes with a clear message
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Push** to your fork and **open a Pull Request** against `main`
5. Ensure all checks pass (`npm run lint && npm run test`)

---

## 📄 License

This project is open source. See the repository for license details.

---

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=footer" width="100%"/>
</p>

<p align="center">
  Built with ❤️ by <a href="https://github.com/johan-droid">@johan-droid</a>
</p>
