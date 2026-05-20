# University Housekeeping Management System

Campus housekeeping and hygiene compliance platform with role-aware workflows, complaint intelligence, and building-wide facility tracking.

## Why This Project Stands Out

UHMS turns hygiene operations into a measurable, auditable system:

- Multi-role operations across Admin, Supervisor, Cleaning Staff, and Student/Faculty
- Building-floor-direction washroom tracking with supply visibility
- Rule-based complaint categorisation and priority analysis (12 categories, urgency detection, sentiment)
- Supervisor washroom checklists with per-item completion and camera proof
- H2 Hostel facility tracker with per-item cleaning photo log and admin checklist view
- Supervisor reminders and staff coordination
- Web platform with Python HTTP server for local serving

## Product Snapshot

### Core Modules

- Authentication and role-based dashboards
- Complaints lifecycle with AI-assisted metadata and media evidence
- Washroom status and consumables monitoring (soap, tissue, sanitizer levels)
- Supervisor washroom checklists with per-item completion and photo proof
- H2 Hostel facility update log (rooms, washrooms, appliances) with admin view
- Supervisor reminders and staff coordination
- Reporting-ready documentation (HTML + PDF)

### Role Experience

- Admin: governance, building-to-supervisor mapping, washroom/inventory/staff oversight, live work monitoring, and H2 facility checklist log
- Supervisor: complaints in assigned buildings, supply stats updates, per-washroom checklist submissions, and full staff-tools mode (tasks/issues/upload)
- Cleaning Staff: assigned task execution and updates
- Student/Faculty: complaint submission and tracking

## Architecture

### Frontend

- Single-page web app in [index.html](index.html)
- Deployment mirror in [frontend-dist/index.html](frontend-dist/index.html)

### Backend

- Node.js/Express API in [backend/server.js](backend/server.js)
- Routes in [backend/routes](backend/routes)
- Database access in [backend/database](backend/database)
- Middleware stack in [backend/middleware](backend/middleware)

### Mobile

- React Native WebView app in [mobile-src/App.js](mobile-src/App.js)

## Tech Stack

- Frontend: HTML, CSS, JavaScript (single-file SPA)
- Backend: Node.js, Express
- AI: Rule-based analysis (keyword categorisation + urgency detection + sentiment)
- Data: PostgreSQL + Redis
- Mobile: React Native + WebView
- DevOps: Docker Compose, Nginx

## Quick Start

### 1) Run Backend

```bash
cd backend
npm install
cp .env.example .env
npm run init-db
npm run dev
```

### 2) Serve Web App

```bash
# From project root
python3 -m http.server 8000
# Then open http://localhost:8000
```

### 3) Run Mobile (Android)

```bash
cd mobile-src
npm install
npx react-native run-android
```

## Demo Credentials

- Admin: `admin@hostel.com` / `password123`
- Supervisor: `meera@hostel.com` / `password123`
- Cleaning Staff: `rajesh@hostel.com` / `password123`
- Student: `student1@hostel.com` / `password123`

## API Surface

Representative endpoint groups:

- /api/auth
- /api/complaints
- /api/dashboard
- /api/staff
- /api/rooms
- /api/washrooms
- /api/facilities
- /api/work-submissions
- /api/reminders
- /api/ai

Note: Work submission image verification is currently simulated in backend logic and is still enforced through supervisor approval before completion.

## Repository Contents

- [UHMS_Documentation.html](UHMS_Documentation.html)
- [UHMS_Documentation.pdf](UHMS_Documentation.pdf)
- [docker-compose.yml](docker-compose.yml)
- [deploy.sh](deploy.sh)

## Production Notes

- Replace debug/mobile signing setup with production keystore before store release.
- Keep all .env files private.
- Do not commit local database or upload runtime files.

## License

Private project. All rights reserved.
