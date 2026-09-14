# Riverside Community Hub — API Reference

Base URL (production): `https://riverside-community-hub-3.onrender.com`
Base URL (local): `http://localhost:4000`

## Conventions

- All request/response bodies are JSON. Set `Content-Type: application/json` on requests with a body.
- Protected routes require `Authorization: Bearer <supabase-access-token>`, taken from the frontend's Supabase session (`session.access_token`).
- Error responses look like `{ "error": "message" }`. There is no unified error-code scheme — check the HTTP status.
- Paginated list routes accept `?page=1` (default `1`) and return 20 items per page as `{ ..., total, page, pageSize }`.

## Auth model

Two layers, applied per route below:
- **`requireAuth`** — verifies the bearer token with Supabase, then looks up the caller's role from `profiles`. Adds `req.user = { id, email, role }`. Returns `401` if the token is missing/invalid, `403` if no profile row exists.
- **`requireRole([...roles])`** — must follow `requireAuth`. Returns `403` if `req.user.role` isn't in the allowed list.

Roles: `member`, `staff`, `admin`. `admin` is not automatically granted staff powers by any special-case code — a route open to `['staff', 'admin']` lists both explicitly.

---

## `GET /health`

Public. Returns `{ "status": "ok" }`. Used for uptime checks (Render).

---

## Auth — `/auth`

### `POST /auth/complete-signup`
Public. Called by the frontend immediately after `supabase.auth.signUp()` succeeds, to create the matching `profiles` row (Supabase Auth creates the user; this creates their app profile).

**Body:** `{ "userId": string, "fullName": string }`

- Verifies `userId` is a real Supabase Auth user before inserting.
- New profiles are always created with `role: "member"`, `membership_tier: "free"`. Staff/admin accounts can't be self-provisioned through this route — they're created manually in Supabase (insert directly into `profiles` with the desired role after the user signs up).
- If a profile already exists for that `userId`, returns `200 { "message": "Profile already exists" }` instead of erroring (handles double-submits).

**Responses:** `201 { "profile": {...} }` · `400` (missing fields / invalid user / insert error)

### `GET /auth/me`
Requires auth. Returns `{ "user": { id, email, role } }` for the caller — useful for confirming what the token resolves to.

---

## Resources — `/resources`

### `GET /resources`
Public. Lists all bookable rooms/equipment, ordered by name.
**Response:** `{ "resources": [{ id, name, type, capacity, description }] }`

### `POST /resources`
Requires auth + role `staff` or `admin`. Adds a new bookable resource (inventory management).
**Body:** `{ "name": string, "type": "room" | "equipment", "capacity"?: number, "description"?: string }`
**Responses:** `201 { "resource": {...} }` · `400` (missing name/type)

---

## Bookings — `/bookings`

### `POST /bookings`
Requires auth (any role). Member submits a booking request; always created with `status: "pending"`.
**Body:** `{ "resourceId": string, "startTime": ISO8601, "endTime": ISO8601 }`
**Responses:**
- `201 { "booking": {...} }`
- `409 { "error": "This resource is already booked for that time" }` — the database's exclusion constraint rejected an overlapping pending/approved booking for the same resource. This is enforced at the Postgres level, not just checked in application code.
- `400` for missing fields or other DB errors.

### `GET /bookings/mine`
Requires auth. Returns the caller's own bookings (with resource name/type joined in), soonest first.

### `GET /bookings`
Requires auth + role `staff`/`admin`. Returns **all** bookings, paginated, newest first, with resource and member name joined in.
**Query:** `?page=1`

### `PATCH /bookings/:id/status`
Requires auth + role `staff`/`admin`. Approves or rejects a pending booking (or force-cancels one).
**Body:** `{ "status": "approved" | "rejected" | "cancelled" }`
**Responses:** `200 { "booking": {...} }` · `400` (invalid status value)

### `PATCH /bookings/:id/cancel`
Requires auth. A member cancels their **own** pending booking.
**Responses:** `200 { "booking": {...} }` · `403 { "error": "Not your booking" }` if the booking belongs to someone else.

---

## Donations — `/donations`

### `GET /donations/campaigns`
Public. Lists active campaigns with `current_amount` / `goal_amount` for progress bars.

### `POST /donations`
Public — **no auth required**, deliberately, so anonymous/logged-out visitors can donate. If a logged-in member wants the donation tied to their account, the frontend passes their own `donorId`; the API does not verify this against the caller's token, since there is no caller token on this route.
**Body:** `{ "campaignId": string, "amount": number, "isRecurringPledge"?: boolean, "donorId"?: string | null }`
- `amount` must be `> 0`.
- A successful insert triggers a Postgres trigger that adds `amount` onto the campaign's `current_amount` automatically.
**Responses:** `201 { "donation": {...} }` · `400` (missing/invalid campaignId or amount)

### `GET /donations`
Requires auth + role `staff`/`admin`. All donations, paginated, newest first, with campaign title and donor name joined in.

### `GET /donations/export`
Requires auth + role `staff`/`admin`. Streams a CSV (`Content-Disposition: attachment; filename="donations.csv"`) of every donation: date, donor (or "Anonymous"), campaign, amount, recurring-pledge flag. Not paginated — pulls the full table.

---

## Members — `/members`

### `GET /members`
Requires auth + role `staff`/`admin`. Paginated member directory with optional name search.
**Query:** `?page=1&search=jane`
Each member includes a computed `membership_status`: `active`, `expiring_soon` (≤30 days from a 365-day expiry window starting at `joined_at`), or `expired`. This is calculated on read, not stored.

### `GET /members/stats`
Requires auth + role `staff`/`admin`. Powers the admin dashboard's three summary cards.
**Response:** `{ "bookingsThisMonth": number, "totalDonations": number, "activeMembers": number }`
Note: `activeMembers` currently counts **all** profiles, not just members with `membership_status: active` — worth confirming that's the intended definition before the client demo.

---

## Known gaps to close before handover

- **`backend/supabase/policies.sql` and `seed.sql` are currently empty** in the repo. The brief and this project's own README both state RLS policies are a checkpoint criterion ("enforced via Supabase Auth + Row Level Security policies, not just hidden UI"), but right now every route is enforced only at the Express layer using the Supabase **service-role** key, which bypasses RLS entirely. If RLS is graded directly against the Supabase project, this needs policies written and applied before submission.
- No endpoint currently returns booking conflicts/availability ahead of submission (`GET /resources/:id/availability` or similar) — the frontend finds out about a conflict only when `POST /bookings` returns `409`.