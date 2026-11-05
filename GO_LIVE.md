# PULSE – Go Live Guide (The Seaside Schools)

## Your admin account

| Field | Value |
|-------|--------|
| Email | `ifeanyi.chukwuedo@theseasideschool.com` |
| Role | Admin |
| Temporary password | `SeasideAdmin2026!` |

**Change this password after first login** (or ask the team to wire change-password UI next).

---

## 1. Push this code to GitHub

From your machine (after copying these updates into your repo):

```bash
git add .
git commit -m "Secure auth: real password login + Seaside brand colours"
git push
```

## 2. Deploy API on Render (Free)

1. [dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Build:** `npm install`
   - **Start:** `npm start`
   - **Health check:** `/api/health`
   - **Instance:** Free
4. Environment variables:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `PULSE_SESSION_SECRET` | long random string (Generate) |
| `ALLOWED_ORIGINS` | `https://seaside-pulse-staging.vercel.app` |

5. Deploy → open `https://YOUR-SERVICE.onrender.com/api/health`  
   Expect: `{ "ok": true, "seeded": true }`

**Note:** Free tier sleeps after 15 min idle and the JSON DB resets on sleep/redeploy. Fine for testing; upgrade later for real school use.

## 3. Point Vercel frontend at the API

Vercel project → **Settings** → **Environment Variables**:

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://YOUR-SERVICE.onrender.com` (no trailing slash) |

Then **Redeploy** the frontend.

## 4. Sign in

1. Open the staging site
2. Email: `ifeanyi.chukwuedo@theseasideschool.com`
3. Password: `SeasideAdmin2026!`

Demo logins are **disabled** when `NODE_ENV=production` (unless you set `ALLOW_DEMO_LOGIN=true`).

## 5. Brand colours applied

From The Seaside Schools PPT:

- Primary blue: `#0040A0`
- Accent red: `#D02010`
- School logo on login page

---

## Security changes in this release

- Passwords hashed with Node `crypto.scrypt`
- Login requires password when a user has `passwordHash` or in production
- Demo routes return 403 in production
- `passwordHash` never sent to the client
- `POST /api/auth/change-password` available for authenticated users


## UI refresh (this package)

- Shared medals, badges, podium cards (`src/components/ui/Visuals.tsx`)
- Leaderboard: dark brand hero, gold/silver/bronze podium, category chips
- Student dashboard: badge wall + rank medals on class top 3
- Parent portal: family recognition badges
- Login: school logo, colour ribbons, sample achievement badges
- Navbar: school logo + PULSE wordmark in Seaside blue
- Palette: `#0040A0` blue · `#D02010` red · gold accents


### Latest polish
- Animated confetti on Top 3 podium (plays when leaderboard category/timeframe changes)
- Illustrated empty states for Messages, Points, and Corrections
- **Change password** from the account menu (desktop + mobile); uses `POST /api/auth/change-password`
