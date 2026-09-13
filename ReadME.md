# Riverside Community Hub

A membership, facility-booking, and donation platform for Riverside Community Hub — a nonprofit community centre offering youth programmes, a small gym, meeting/event rooms, and a food-parcel donation drive.


## Live URLs

- **Frontend:** https://riverside-community-hub-delta.vercel.app
- **Backend API:** https://riverside-community-hub-3.onrender.com
- **Backend health check:** https://riverside-community-hub-3.onrender.com/health



## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript (Vite), React Router, Tailwind CSS v4 |
| Backend | Node.js + Express + TypeScript |
| Database & Auth | Supabase (Postgres, Supabase Auth, Row Level Security) |
| Deployment | Frontend on Vercel, Backend on Render, Database on Supabase (managed) |

## Project structure

```
Riverside Community Hub/
  backend/
    src/
      config/       — Supabase client setup (anon + admin)
      middleware/    — auth verification, role gating
      routes/        — auth, bookings, resources, donations, members
      types/         — shared TypeScript types
    supabase/
      schema.sql     — table definitions
      policies.sql   — Row Level Security policies
      seed.sql       — starter data (rooms, equipment, campaign)
  frontend/
    src/
      pages/         — one component per route
      components/    — shared components (ProtectedRoute)
      context/       — AuthContext (session + role)
      lib/           — Supabase client
```

## Local setup

### Prerequisites
- Node.js 20+
- A Supabase project (free tier is fine)

### 1. Clone and install

```bash
git clone <repo-url>
cd "Riverside Community Hub"
```

Backend:
```bash
cd backend
npm install
```

Frontend:
```bash
cd ../frontend
npm install
```

### 2. Set up the database

In the Supabase SQL Editor, run in order:
1. `backend/supabase/schema.sql`
2. `backend/supabase/policies.sql`
3. `backend/supabase/seed.sql`

### 3. Environment variables

**`backend/.env`**
```
PORT=4000
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

⚠️ The service role key bypasses Row Level Security. It is used server-side only and must never be exposed to the frontend or committed to version control.

**`frontend/.env`**
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_API_URL=http://localhost:4000
```

### 4. Run locally

Two terminals:

```bash
# Terminal 1 — backend
cd backend
npm run dev
```

```bash
# Terminal 2 — frontend
cd frontend
npm run dev
```

Backend runs on `http://localhost:4000`, frontend on `http://localhost:5173`.

### 5. Create test accounts

Sign up normally through `/signup` to create a member account. Staff and admin accounts must be created manually:

1. Supabase Dashboard → Authentication → Users → Add user
2. Copy the generated user UUID
3. In the SQL Editor:
```sql
insert into profiles (id, full_name, role, membership_tier)
values ('paste-uuid-here', 'Staff Name', 'staff', 'standard');
-- use role = 'admin' for an admin account
```

## User roles

| Role | Can do |
|---|---|
| Public visitor | Browse programmes/facilities, view availability, see donation progress |
| Member | Everything above, plus book facilities, manage own bookings, donate |
| Staff | Everything above, plus approve/reject bookings, manage inventory, view member directory |
| Admin | Everything above, plus manage staff accounts, view financial reports, configure programmes |

Roles are enforced at the database level via Row Level Security, not just hidden UI.

## Architecture notes

- **Authentication**: Supabase Auth handles signup/login directly from the frontend. The backend verifies JWTs on protected routes and looks up the user's role from the `profiles` table.
- **Double-booking prevention**: enforced at the database level with a Postgres exclusion constraint on the `bookings` table — not just a UI check.
- **Donations**: insert-open to the public (including anonymous, logged-out visitors) per the brief's requirement; update/export restricted to staff and admin.

## Deployment

- **Backend (Render)**: Root directory `backend`, build command `npm install && npm run build`, start command `npm start`. Environment variables set in Render's dashboard, matching `backend/.env`.
- **Frontend (Vercel)**: Root directory `frontend`, framework preset Vite. Environment variables set in Vercel's dashboard, matching `frontend/.env`, with `VITE_API_URL` pointing at the deployed Render URL.
- Both platforms auto-deploy on push to the `main` branch.

