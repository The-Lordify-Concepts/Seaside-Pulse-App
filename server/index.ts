/**
 * PULSE API – Express server
 * Local:  npm run server
 * Seed:   npm run server:seed
 * Prod:   npm start  (auto-seeds if DB missing)
 */
import 'dotenv/config';
import express from 'express';
import { spawnSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import pulseRoutes from './routes/pulse.js';
import { DATA_DIR, DB_FILE, dbExists } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3001);
const app = express();

/** Comma-separated list of allowed browser origins. Empty = reflect request origin (dev-friendly). */
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function ensureSeeded() {
  if (dbExists()) {
    console.log(`Database ready: ${DB_FILE}`);
    return;
  }
  console.log('No database found — running seed…');
  const seedPath = path.join(__dirname, 'seed.ts');
  const result = spawnSync('npx', ['tsx', seedPath], {
    env: { ...process.env },
    stdio: 'inherit',
    shell: false
  });
  if (result.status !== 0) {
    console.error('Seed failed. API will start but routes may error until seed succeeds.');
  }
}

ensureSeeded();

app.set('trust proxy', 1);
app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (!origin) {
    // Non-browser clients (curl, server-to-server)
    res.setHeader('Access-Control-Allow-Origin', '*');
  } else if (ALLOWED_ORIGINS.length === 0) {
    // Dev / open mode: reflect origin
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else if (ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
    // Reject unknown origins for credentialed requests
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGINS[0]);
  }

  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'pulse-api',
    seeded: dbExists(),
    dataDir: DATA_DIR,
    time: new Date().toISOString()
  });
});

app.get('/', (_req, res) => {
  res.json({
    service: 'PULSE API',
    health: '/api/health',
    docs: 'See DEPLOY.md'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/pulse', pulseRoutes);

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PULSE API listening on 0.0.0.0:${PORT}`);
  console.log(`Health: /api/health`);
  console.log(`DATA_DIR=${DATA_DIR}`);
  if (ALLOWED_ORIGINS.length) {
    console.log(`CORS origins: ${ALLOWED_ORIGINS.join(', ')}`);
  } else {
    console.log('CORS: reflecting request Origin (set ALLOWED_ORIGINS in production)');
  }
});
