# PULSE – Seaside Schools Parents Leaderboard & Communications

Educational platform connecting schools and families through positive habit recognition, weighted Impact Scores (80% student / 20% parent), fair multi-child balancing, and multi-channel communication.

## Quick start (frontend demo – mock data)

```bash
npm install
npm run dev
```

Open http://localhost:3000 and use **Instant Demo Access** on the login page.

## Real backend (JSON store → ready for Postgres later)

```bash
npm install
npm run server:seed   # creates server/data/pulse-db.json
npm run server        # API on http://localhost:3001
```

In another terminal:

```bash
cp .env.example .env
# VITE_API_URL=http://localhost:3001
npm run dev
```

With the Vite proxy, local requests to `/api` are forwarded to port 3001.

### API surface

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | no | Health + seed status |
| POST | `/api/auth/login` | no | `{ email, password? }` |
| POST | `/api/auth/demo` | no | `{ userId }` demo login |
| GET | `/api/auth/me` | yes | Current user |
| POST | `/api/auth/logout` | yes | Revoke session |
| GET | `/api/pulse/bootstrap` | yes | Full app state |
| GET | `/api/pulse/leaderboard?timeframe=` | yes | Ranked families |
| POST | `/api/pulse/points` | teacher/admin | Award points |
| POST | `/api/pulse/messages` | staff | Send message |
| POST | `/api/pulse/messages/:id/acknowledge` | parent | Ack + optional points |
| POST | `/api/pulse/corrections` | parent | Request correction |
| POST | `/api/pulse/corrections/:id/resolve` | staff | Resolve correction |
| PUT | `/api/pulse/rules` | admin | Update category weights |

Sessions use Bearer tokens (`pulse_api_token_v1` in localStorage).

### Deploy notes

- Frontend: existing Vite static deploy on Vercel still works in mock mode.
- API: run Express on a Node host (Railway, Render, Fly, VPS) or migrate routes to Vercel serverless later.
- Set `PULSE_SESSION_SECRET` in production.
- Point `VITE_API_URL` at the public API origin before building the frontend.

## Demo accounts

| Role | Email | User id |
|------|-------|---------|
| Parent | elena.bennett@seasideschools.edu | user-parent-bennett |
| Student | leo.bennett@student.seasideschools.edu | user-student-leo |
| Teacher | marcus.reed@seasideschools.edu | user-teacher-reed |
| Admin | katherine.shaw@seasideschools.edu | user-admin-shaw |

Password is not enforced in demo mode yet.
