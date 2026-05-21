# University Housekeeping Management System (UHMS)

A full-stack web application for managing housekeeping operations across university buildings — hostels, academic blocks, and shared facilities. Supervisors and staff can log cleaning activity, track supplies, submit photo-verified checklists, and raise maintenance complaints. Admins get a unified dashboard across all buildings. A companion Android app wraps the web app in a native shell for on-the-go use.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Directory Structure](#directory-structure)
5. [Buildings & Floor Configuration](#buildings--floor-configuration)
6. [User Roles & Permissions](#user-roles--permissions)
7. [Features](#features)
8. [Database Schema](#database-schema)
9. [API Reference](#api-reference)
10. [Environment Variables](#environment-variables)
11. [Local Development](#local-development)
12. [Production Deployment (Render + Neon)](#production-deployment-render--neon)
13. [Mobile App (Android)](#mobile-app-android)
14. [Automated Schedulers](#automated-schedulers)
15. [Migration System](#migration-system)
16. [Demo Credentials](#demo-credentials)

---

## Overview

UHMS replaces paper-based hostel cleaning logs with a real-time digital system. Key capabilities:

- **Facility Cleaning Tracker** — per-room/per-area cleaning status with photo proof, automatically reset every 8 hours at shift change
- **Washroom Checklists** — supervisor-submitted digital checklists (mopping, soap refill, tissue, sanitizer, etc.) with per-item photo uploads
- **Complaint Management** — residents raise maintenance requests; staff and supervisors resolve them; AI service suggests priority and category
- **Supply Inventory** — washroom supply levels (soap, tissue, sanitizer) tracked per washroom point
- **Work Submissions** — staff submit work records for supervisor approval
- **Reminders** — supervisors can set time-based reminders for recurring tasks
- **Role-Based Dashboards** — separate views for Admin, Supervisor, Staff, and Resident

The entire frontend is a single-file SPA (`index.html`, ~7500 lines of vanilla JS + Tailwind CSS) served directly by Express. No build step required.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla JS SPA (single HTML file), Tailwind CSS |
| Backend | Node.js 18+, Express 4 |
| Database | PostgreSQL 15 via [Neon.tech](https://neon.tech) (serverless Postgres) |
| ORM / Query Builder | Knex.js |
| Cache | Redis (optional — app degrades gracefully without it) |
| Auth | JWT (access token 7d, refresh token 30d) |
| File Uploads | Multer (stored in `backend/uploads/`) |
| Hosting | [Render.com](https://render.com) free web service |
| Mobile | React Native + Expo (WebView wrapper) |
| APK Builds | EAS Build (Expo cloud) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser / Mobile App                 │
│              index.html (SPA — served by Express)           │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────┐
│                   Express Server (Node.js)                  │
│   backend/server.js — port 3001 (local) / 10000 (Render)   │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────────┐  │
│  │ Auth Routes │  │ API Routes  │  │ Static File Server │  │
│  │ /api/auth   │  │ /api/*      │  │ /uploads  /        │  │
│  └─────────────┘  └──────┬──────┘  └────────────────────┘  │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────────┐   │
│  │              Knex.js Query Builder                   │   │
│  └───────────────────────┬──────────────────────────────┘   │
│                          │                                  │
│  ┌───────────┐  ┌────────▼────────┐  ┌───────────────────┐ │
│  │   Redis   │  │   PostgreSQL    │  │  Schedulers       │ │
│  │  (cache)  │  │   (Neon.tech)   │  │  • FacilityReset  │ │
│  │ optional  │  │  primary store  │  │  • Reminders      │ │
│  └───────────┘  └─────────────────┘  └───────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Request flow:**
1. All traffic hits Express. Static files (HTML/CSS/JS) served from project root.
2. `/api/*` routes handled by Express middleware chain: rate limiter → auth → route handler → error handler.
3. JWT verified in `backend/middleware/auth.js`; role guards applied per-route via `requireRole()`.
4. Knex builds parameterized SQL queries; results returned as JSON.
5. File uploads (photos) saved to `backend/uploads/` and served at `/uploads/`.
6. Two `setInterval` schedulers run on the primary cluster worker: facility reset (every 8 h) and reminder checker.

---

## Directory Structure

```
uhms/
├── index.html                     # SPA frontend (served directly by Express)
├── frontend-dist/
│   └── index.html                 # Mirror of root index.html (for Render build)
├── Procfile                       # Render / Heroku start command
├── render.yaml                    # Render deployment config
├── .env                           # Local dev environment variables
├── backend/
│   ├── server.js                  # Express app entry point
│   ├── config/
│   │   ├── index.js               # Unified config (reads env vars)
│   │   └── knexfile.js            # Knex database config per environment
│   ├── database/
│   │   ├── postgres.js            # Knex connection instance
│   │   ├── migrations/            # All schema + seed migrations (auto-run on start)
│   │   └── seeds/
│   │       └── 001_initial_data.js  # Demo users, rooms, floors
│   ├── middleware/
│   │   ├── auth.js                # JWT verification + role guards
│   │   ├── errorHandler.js        # Global Express error handler
│   │   ├── requestLogger.js       # Per-request structured logging
│   │   └── validator.js           # Joi request body validation
│   ├── routes/
│   │   ├── auth.js                # /api/auth — login, register, token refresh
│   │   ├── rooms.js               # /api/rooms — room status management
│   │   ├── complaints.js          # /api/complaints — maintenance requests
│   │   ├── staff.js               # /api/staff — staff & resident directory
│   │   ├── ai.js                  # /api/ai — AI analysis endpoints
│   │   ├── dashboard.js           # /api/dashboard — role-specific stats
│   │   ├── washrooms.js           # /api/washrooms — supply levels, checklists
│   │   ├── facilities.js          # /api/facilities — cleaning tracker
│   │   ├── work-submissions.js    # /api/work-submissions — staff work log
│   │   └── reminders.js           # /api/reminders — task reminders
│   ├── services/
│   │   ├── aiService.js           # Calls AI microservice (optional)
│   │   ├── cacheService.js        # Redis wrapper (graceful no-op if offline)
│   │   ├── facilityResetService.js  # 8-hour shift-based status reset
│   │   ├── reminderService.js     # Reminder notification scheduler
│   │   └── smsService.js          # SMS notifications (optional)
│   ├── scripts/
│   │   ├── start.js               # Production startup: run migrations → start server
│   │   └── initDb.js              # Manual DB init utility (npm run init-db)
│   └── utils/
│       └── logger.js              # Winston logger (file + console)
└── .gitignore
```

---

## Buildings & Floor Configuration

UHMS tracks five buildings. Each building has a set of floors, and each floor has a configured list of facility types.

### H1 Hostel (10 floors: G, 1–9)

| Floor | Facilities |
|---|---|
| G (Ground) | Lobby, Warden Room, Lift Lobby |
| 1–9 (odd) | 25 Rooms, Washroom (Male), Washroom (Female), Washing Machine, Pantry, Corridor, Balcony |
| 1–9 (even) | 25 Rooms, Washroom (Male), Washroom (Female), Pantry, Corridor, Balcony |
| 6 (special) | MR1, MR2, MR3, MR4 (Meeting Rooms), Washroom (Male), Washroom (Female), Pantry |

Room numbers: `{floor}01` – `{floor}25` (e.g., floor 3 → 301–325).
6th floor meeting rooms: MR1–MR4.

### H2 Hostel (10 floors: G, 1–9)

| Floor | Facilities |
|---|---|
| G (Ground) | Lobby, Warden Room, Lift Lobby |
| 1–9 (odd) | 25 Rooms, Washroom (Male), Washroom (Female), Washing Machine, Pantry, Corridor, Balcony |
| 1–9 (even) | 25 Rooms, Washroom (Male), Washroom (Female), Pantry, Corridor, Balcony |

Room numbers: sequential 1–25 per floor.
Pantry facilities on non-ground floors are grouped under a collapsible "Pantry" section in the UI.

### A1 – Bharti Academic Building (5 floors: G, 1–4)

| Floor | Facilities |
|---|---|
| G | Lobby, Washroom (Male), Washroom (Female), Washroom (Inclusive) |
| 1–4 | Classrooms (varies by floor), Washroom (Male), Washroom (Female), Corridor |

### A4 – HDFC Innovation Hub (2 floors: G, 1)

| Floor | Facilities |
|---|---|
| G | Lobby, Meeting Room, Washroom (Male), Washroom (Female) |
| 1 | Conference Room, Washroom (Male), Washroom (Female) |

### A2 – Havells Building (5 floors: G, 1–4)

| Floor | Facilities |
|---|---|
| G | Lobby, Washroom (Male), Washroom (Female) |
| 1–4 | Labs / Classrooms, Washroom (Male), Washroom (Female), Corridor |

---

## User Roles & Permissions

| Role | Description | Key Capabilities |
|---|---|---|
| `admin` | Admin Manager | Full access: all buildings, all staff, all complaints, facility tracking, washroom checklists across all buildings |
| `supervisor` | Shift Supervisor | Facility cleaning updates (photo proof), washroom checklists, complaint assignment, work submission approvals, reminders |
| `staff` | Cleaning Staff | Update room/supply status, submit work records, view assigned tasks |
| `resident` | Hostel Resident | Raise maintenance complaints, view own complaint status |

Role assignment is fixed at registration and enforced server-side via JWT claims on every API call.

---

## Features

### Facility Cleaning Tracker

Supervisors select a building and floor to see a grid of all facilities. For each facility they mark it **Cleaned** (requires photo upload) or **Not Cleaned** (requires written comment). Per-washroom checklists (6 items: floor mopping, sink cleaning, dustbin cleared, soap refill, tissue refill, sanitizer refill) can be submitted with per-item photos.

All cleaning fields reset automatically every **8 hours** via `facilityResetService` — ensuring each shift starts with a clean slate.

### Washroom Checklists (Admin View)

Admins can view submitted washroom cleaning records across all buildings. Filterable by building, floor, and date. Each record shows the supervisor name, submission time, checklist items completed, and photos.

### Complaint Management

- Residents submit complaints with category, description, and optional photo.
- AI service (if configured) auto-suggests priority (low/medium/high) and category.
- Supervisors and admins assign complaints to staff; staff resolve and log notes.
- Full history log per complaint.

### Supply Inventory

Washroom supply levels (soap, tissue, sanitizer) stored as percentage values per washroom point. Staff update levels during rounds; the admin dashboard shows aggregate supply health.

### Work Submissions

Staff submit work completion records (with optional photo evidence) for supervisor review and approval.

### Reminders

Supervisors create one-off or recurring reminders for tasks. The reminder scheduler checks every minute and sends in-app notifications when reminders fall due.

### AI Integration (Optional)

The `/api/ai` routes proxy to a separate Python AI microservice (`AI_SERVICE_URL`). If the microservice is not running, AI endpoints return fallback responses — the core app continues to work normally.

### Home Stats (Public)

`GET /api/home-stats` returns live counts (requests today, pending, resolved, supply health) for the login/landing screen — no authentication required.

---

## Database Schema

All tables created and managed via Knex migrations, run automatically on every server start.

### Core Tables

| Table | Purpose |
|---|---|
| `users` | All user accounts (UUID PK, role enum, bcrypt password) |
| `refresh_tokens` | JWT refresh token store |
| `password_reset_otps` | OTP tokens for forgot-password flow |
| `floors` | Building floor records (legacy; used by rooms) |
| `rooms` | Individual room records per floor |
| `complaints` | Maintenance requests (status: pending/in_progress/resolved) |
| `cleaning_logs` | Audit log of cleaning activities |
| `notifications` | In-app notification queue per user |
| `ai_insights` | Cached AI analysis results |
| `audit_logs` | General system audit trail |

### Facility Tracking Tables

| Table | Purpose |
|---|---|
| `facility_updates` | One row per facility per building/floor. Columns: `building`, `floor`, `facility_type`, `facility_number`, `cleaned` (yes/no/null), `last_updated`, `updated_by`, `photo_url`, `comment`, `checklist_items` (JSONB) |
| `washrooms` | Washroom supply levels (`soap_level`, `tissue_level`, `sanitizer_level` as 0–100 integers) |
| `washroom_checklists` | Supervisor-submitted washroom checklist entries (linked to washroom ID) |

### Supporting Tables

| Table | Purpose |
|---|---|
| `supply_inventory` | Supply stock tracking (name, quantity, unit, low-stock threshold) |
| `work_submissions` | Staff work records awaiting supervisor approval |
| `reminders` | Scheduled task reminders per supervisor |

### facility_updates — checklist_items JSONB structure

```json
{
  "floor_mopping":    { "completed": true,  "photo_url": "/uploads/...", "completed_at": "ISO8601", "comment": null },
  "sink_cleaning":    { "completed": true,  "photo_url": "/uploads/...", "completed_at": "ISO8601", "comment": null },
  "dustbin_cleared":  { "completed": false, "photo_url": null, "completed_at": null, "comment": "Bin full, reported" },
  "soap_refill":      { "completed": true,  "photo_url": "/uploads/...", "completed_at": "ISO8601", "comment": null },
  "tissue_refill":    { "completed": true,  "photo_url": "/uploads/...", "completed_at": "ISO8601", "comment": null },
  "sanitizer_refill": { "completed": true,  "photo_url": "/uploads/...", "completed_at": "ISO8601", "comment": null }
}
```

---

## API Reference

All `/api/*` routes (except login, register, home-stats) require `Authorization: Bearer <token>`.

### Auth — `/api/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | None | Create account |
| POST | `/login` | None | Get JWT access + refresh tokens |
| POST | `/refresh` | None | Exchange refresh token for new access token |
| POST | `/logout` | Token | Invalidate refresh token |
| POST | `/forgot-password/request-otp` | None | Send OTP to phone |
| POST | `/forgot-password/reset` | None | Reset password with OTP |
| GET | `/me` | Token | Get current user profile |
| PUT | `/me` | Token | Update name/phone/avatar |
| PUT | `/password` | Token | Change password |

### Rooms — `/api/rooms`

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/` | All | List all rooms |
| GET | `/by-floor` | All | Rooms grouped by floor |
| GET | `/:id` | All | Single room details |
| PUT | `/:id/status` | All | Update room cleaning status |
| PUT | `/:id/assign` | Admin | Assign staff to room |
| GET | `/my/tasks` | Staff | Rooms assigned to current user |
| GET | `/:id/history` | All | Cleaning history for a room |

### Complaints — `/api/complaints`

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/` | All | List complaints (role-filtered) |
| GET | `/:id` | All | Complaint detail |
| POST | `/` | All | Submit new complaint (image optional) |
| PUT | `/:id/status` | All | Update status + resolution notes |
| PUT | `/:id/assign` | Admin, Supervisor | Assign to staff |
| PUT | `/:id/priority` | Admin, Supervisor, Staff | Change priority |
| DELETE | `/:id` | All | Delete complaint |
| GET | `/my/list` | Resident | Own complaints |
| GET | `/assigned/list` | Staff | Complaints assigned to me |

### Staff — `/api/staff`

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/` | Admin, Supervisor | List all staff |
| GET | `/:id` | Admin | Staff member details |
| POST | `/:id/floors` | Admin | Assign floor to staff |
| DELETE | `/:id/floors/:floorId` | Admin | Remove floor assignment |
| GET | `/:id/performance` | Admin | Performance metrics |
| GET | `/residents/list` | Admin | List all residents |

### Dashboard — `/api/dashboard`

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/admin` | Admin | Full system stats and metrics |
| GET | `/staff` | Staff | Staff-specific stats |
| GET | `/supervisor` | Supervisor | Supervisor-level stats |
| GET | `/resident` | Resident | Resident-specific view |
| GET | `/notifications` | All | Unread notifications |
| PUT | `/notifications/:id/read` | All | Mark notification read |
| PUT | `/notifications/read-all` | All | Mark all notifications read |

### Washrooms — `/api/washrooms`

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/` | All | List all washroom points |
| GET | `/by-building` | All | Washrooms grouped by building |
| GET | `/checklists` | Admin, Supervisor | Checklist submission history |
| GET | `/:id` | All | Single washroom details |
| GET | `/:id/checklist/latest` | Admin, Supervisor, Staff | Latest checklist for washroom |
| POST | `/:id/checklist` | Supervisor | Submit checklist (with photos) |
| PUT | `/:id/supplies` | Admin, Supervisor, Staff | Update supply levels |
| PUT | `/:id/status` | Admin, Supervisor, Staff | Update cleaning status |
| PUT | `/:id/assign` | Admin, Supervisor | Assign staff to washroom |
| GET | `/inventory/all` | All | Supply inventory list |
| PUT | `/inventory/:id` | Admin, Supervisor, Staff | Update inventory item |

### Facilities — `/api/facilities`

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/` | All | Facilities for a building+floor (`?building=H1&floor=3`) |
| GET | `/log` | All | Cleaned facilities log for a building+floor |
| GET | `/washroom-updates` | Admin, Supervisor | Washroom cleaning records (`?building=H1&floor=3&date=YYYY-MM-DD`) |
| PUT | `/:id` | Supervisor | Mark facility cleaned/not cleaned (photo required for 'yes') |

### Work Submissions — `/api/work-submissions`

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/` | All | List submissions (role-filtered) |
| POST | `/` | Staff, Supervisor | Submit work record (image optional) |
| PUT | `/:id/approve` | Supervisor, Admin | Approve submission |
| GET | `/pending/count` | Supervisor, Admin | Count of pending approvals |

### Reminders — `/api/reminders`

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/` | All | List reminders |
| POST | `/` | Supervisor, Admin | Create reminder |
| PUT | `/:id` | Supervisor, Admin | Update reminder |
| DELETE | `/:id` | Supervisor, Admin | Delete reminder |
| GET | `/due/now` | Supervisor, Admin | Reminders due right now |

### AI — `/api/ai`

| Method | Path | Role | Description |
|---|---|---|---|
| GET | `/status` | All | AI service health check |
| POST | `/analyze-complaint` | All | Get priority + category suggestion |
| POST | `/categorize` | All | Categorize complaint text |
| GET | `/optimize-tasks` | All | Task scheduling suggestions |
| GET | `/predictions` | Admin | Predictive maintenance insights |
| GET | `/responses/:complaintId` | Admin, Supervisor, Staff | Suggested resolution responses |
| GET | `/insights` | Admin | System-wide AI insights |
| POST | `/batch-analyze` | Admin | Bulk complaint analysis |

### Public

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | None | Server health (DB + Redis status) |
| GET | `/ready` | None | Kubernetes readiness probe |
| GET | `/api/home-stats` | None | Live counts for landing screen |

---

## Environment Variables

### Required for Production

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (from Neon.tech) |
| `JWT_SECRET` | Random 48+ character string for signing JWTs |
| `NODE_ENV` | Set to `production` |
| `PORT` | Set to `10000` on Render |

### Optional

| Variable | Default | Description |
|---|---|---|
| `REDIS_URL` | — | Redis connection string (app works without it) |
| `APP_URL` | `http://localhost:3001` | Public URL of the deployed app |
| `CORS_ORIGINS` | `localhost:3000,localhost:8081` | Comma-separated allowed origins |
| `JWT_EXPIRY` | `7d` | Access token lifetime |
| `JWT_REFRESH_EXPIRY` | `30d` | Refresh token lifetime |
| `AI_SERVICE_URL` | `http://localhost:8000` | Python AI microservice URL |
| `UPLOAD_MAX_SIZE` | `10485760` (10 MB) | Max upload file size in bytes |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Requests per 15-minute window |
| `RATE_LIMIT_AUTH_MAX` | `20` | Auth attempts per 15-minute window |
| `LOG_LEVEL` | `info` | Winston log level |

### Local Development (`.env`)

```
DB_NAME=ilgc_tracker
DB_USER=ilgc_admin
DB_PASSWORD=devpassword
REDIS_PASSWORD=changeme
JWT_SECRET=dev-jwt-secret
```

See `backend/.env.example` for the full template.

---

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL 15 (local) or a Neon.tech connection string

### Setup

```bash
# Install backend dependencies
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL or individual DB_* variables

# Run migrations + seed demo data (first run only)
npm run init-db

# Start the server
npm run dev        # nodemon (auto-restart on file save)
# or
npm start          # plain node
```

The app is available at `http://localhost:3001`.

### Useful scripts

```bash
# Run only migrations (no seed)
npm run migrate

# Rollback last migration batch
npm run migrate:rollback

# Run seed file manually
npm run seed
```

---

## Production Deployment (Render + Neon)

### Database — Neon.tech

1. Create a free project at [neon.tech](https://neon.tech).
2. Copy the connection string (postgres://...).
3. Add it as `DATABASE_URL` in Render environment variables.

Neon provides serverless Postgres with automatic SSL — no additional `DB_SSL` flag needed (the config detects `DATABASE_URL` and enables `ssl: { rejectUnauthorized: false }` automatically).

### Backend — Render.com

The `render.yaml` file fully describes the service:

```yaml
services:
  - type: web
    name: uhms
    runtime: node
    plan: free
    buildCommand: cd backend && npm install --production
    startCommand: cd backend && node scripts/start.js && node server.js
    healthCheckPath: /health
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

**Deploy steps:**
1. Push to GitHub (`main` branch).
2. Render auto-deploys on every push.
3. `scripts/start.js` runs migrations before the server starts — schema is always up to date.
4. Set `DATABASE_URL` and `JWT_SECRET` manually in the Render dashboard (never commit secrets).

**Free tier note:** Render spins down free services after 15 minutes of inactivity. The first request after spin-down takes ~30 seconds.

---

## Mobile App (Android)

The companion Android app lives in a separate Expo project at `/Users/maruteymani/UHMSMobileTemp/`. It is a React Native WebView wrapper that loads the production web app.

### How it works

The app tries URLs in order:
1. `https://uhms.onrender.com` (production — works anywhere with internet)
2. `http://10.0.2.2:3001` (Android emulator → host machine)
3. `http://10.1.60.103:3001` (local network IP)

If one URL fails, it automatically falls through to the next. All in-app navigation stays inside the WebView; external links open in the device browser.

### Building the APK

```bash
cd /Users/maruteymani/UHMSMobileTemp

# Install EAS CLI if not installed
npm install -g eas-cli

# Log in to Expo
eas login

# Build APK (preview profile)
eas build --platform android --profile preview
```

The build runs in Expo's cloud. When complete, download the `.apk` from the EAS dashboard or the URL printed at the end of the build command.

**EAS project ID:** `320c1676-a57e-496a-a8b5-6e975e0621fb`
**Android package:** `com.uhms.app`

### eas.json profiles

| Profile | Output | Use Case |
|---|---|---|
| `preview` | `.apk` | Direct install on Android device (sideload) |
| `production` | `.aab` | Google Play Store submission |

---

## Automated Schedulers

Two `setInterval`-based schedulers run in the server process. To avoid duplicate execution in cluster mode, they only start on worker ID 1 (or the primary process in development).

### Facility Reset Scheduler (`facilityResetService.js`)

**Interval:** every 8 hours

Resets all active facility cleaning records at each shift change:

```js
await db('facility_updates')
    .whereNotNull('last_updated')
    .update({
        cleaned: null, last_updated: null, updated_by: null,
        checklist_items: null, photo_url: null, comment: null,
        updated_at: db.fn.now(),
    });
```

This ensures supervisors on the new shift start with a blank facility grid rather than seeing stale data from the previous shift.

### Reminder Scheduler (`reminderService.js`)

**Interval:** every 1 minute

Checks for reminders whose due time has passed and haven't been marked completed. Sends in-app notifications to the relevant supervisor.

---

## Migration System

Migrations are Knex.js files in `backend/database/migrations/`. They run automatically on every server start via `scripts/start.js`. Each migration is idempotent — running it twice on an already-migrated database is safe.

### Migration history

| File | Purpose |
|---|---|
| `20240301000001_initial_schema.js` | Core tables: users, floors, rooms, complaints, cleaning_logs, notifications, etc. |
| `20240302000001_hygiene_monitoring.js` | Washroom supply tracking, supply inventory |
| `20240313000001_password_reset_otps.js` | OTP table for forgot-password flow |
| `20260420000001_supervisor_washroom_checklists.js` | `washroom_checklists` table |
| `20260425000001_facility_cleaning_tracker.js` | `facility_updates` table + H2 and H1 hostel seed rows |
| `20260428000001_facility_update_comments.js` | `comment` column on facility_updates |
| `20260521000001_a1_bharti_facility_rows.js` | A1 Bharti Academic Building rows |
| `20260521000002_facility_checklist_items.js` | `checklist_items` JSONB column on facility_updates |
| `20260521000003_recover_a1_checklist_data.js` | A1 data recovery after cleanup |
| `20260521000004_a4_hdfc_facility_rows.js` | A4 HDFC Innovation Hub rows |
| `20260521000005_a2_havells_facility_rows.js` | A2 Havells Building rows |
| `20260522000001_demo_checklist_seed.js` | Sample washroom checklist submissions |
| `20260522000002_h2_full_floor_washrooms.js` | Full H2 washroom coverage across all floors |
| `20260522000003_remove_fake_checklist_data.js` | Remove synthetic test data |
| `20260522000004_restore_facility_demo_data.js` | Re-seed demo facility cleaning records |
| `20260522000005_h1_hostel_facility_rows.js` | H1 Hostel facility rows (all floors) |

---

## Demo Credentials

All demo accounts use password: **`password123`**

| Email | Name | Role |
|---|---|---|
| admin@hostel.com | Admin Manager | Admin |
| meera@hostel.com | Meera Desai | Supervisor (Morning shift) |
| suresh@hostel.com | Suresh Nair | Supervisor (Evening shift) |
| rajesh@hostel.com | Rajesh Kumar | Staff (Morning) |
| priya@hostel.com | Priya Sharma | Staff (Evening) |
| amit@hostel.com | Amit Patel | Staff (Morning) |
| sunita@hostel.com | Sunita Verma | Staff (Evening) |
| student1@hostel.com | Arjun Singh | Resident (H1-101) |
| student2@hostel.com | Neha Gupta | Resident (H2-205) |
| student3@hostel.com | Vikram Reddy | Resident (H3-302) |
| faculty1@hostel.com | Dr. Sneha Iyer | Resident (Academic Block) |
