# Deploy PULSE API

The frontend stays on **Vercel**. The API is a small Node/Express service you host separately.

## Recommended: Render (simplest free tier)

1. Push this repo to GitHub (or deploy from the zip).
2. Go to [https://dashboard.render.com](https://dashboard.render.com) → **New** → **Web Service**.
3. Connect the repo (or upload).
4. Settings:
   - **Runtime:** Node
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Health check path:** `/api/health`
5. Environment variables:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `PULSE_SESSION_SECRET` | long random string |
| `ALLOWED_ORIGINS` | `https://seaside-pulse-typefixed.vercel.app` (and any preview URLs, comma-separated) |
| `PORT` | leave default (Render sets this) |

6. Deploy. When live, open `https://YOUR-SERVICE.onrender.com/api/health` — you should see `"ok": true`.

**Note (free tier):** the filesystem is ephemeral. Data resets when the service sleeps/redeploys. Fine for demos; for real schools use a paid disk or Postgres later.

---

## Alternative: Railway

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub** (or CLI).
2. Root directory = this project.
3. Start command: `npm start` (see `railway.toml`).
4. Variables (same as above): `PULSE_SESSION_SECRET`, `ALLOWED_ORIGINS`.
5. Optional: add a **Volume** mounted at `/data` and set `DATA_DIR=/data` so the JSON DB persists.

```bash
# CLI path
npm i -g @railway/cli
railway login
railway init
railway up
railway variables set PULSE_SESSION_SECRET=... ALLOWED_ORIGINS=https://seaside-pulse-typefixed.vercel.app
```

---

## Alternative: Fly.io

```bash
# Install flyctl, then:
fly auth login
fly launch --name seaside-pulse-api --region lhr --no-deploy
fly volumes create pulse_data --size 1 --region lhr
# Edit fly.toml mounts section, then:
fly secrets set PULSE_SESSION_SECRET=... ALLOWED_ORIGINS=https://seaside-pulse-typefixed.vercel.app
fly deploy
```

---

## Point the Vercel frontend at the API

In the **Vercel project** → Settings → Environment Variables:

| Key | Value |
|-----|--------|
| `VITE_API_URL` | `https://YOUR-API-HOST` (no trailing slash) |

Then **Redeploy** the frontend (Vite bakes env in at build time).

Local check:

```bash
curl https://YOUR-API-HOST/api/health
curl -X POST https://YOUR-API-HOST/api/auth/demo \
  -H 'Content-Type: application/json' \
  -d '{"userId":"user-teacher-reed"}'
```

---

## Env reference

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | no | Default `3001` (hosts often inject this) |
| `PULSE_SESSION_SECRET` | **yes in prod** | Signs session tokens |
| `ALLOWED_ORIGINS` | recommended | Comma-separated browser origins (your Vercel URL) |
| `DATA_DIR` | no | Where `pulse-db.json` lives (use volume path in prod) |
| `NODE_ENV` | no | `production` |

---

## After deploy checklist

1. `/api/health` returns `ok: true`, `seeded: true`
2. Demo login from the live Vercel site works
3. Teacher awards points → data still there after refresh
4. CORS: no browser console errors on API calls from Vercel
