import { Router } from 'express';
import crypto from 'crypto';
import { readDb, writeDb } from '../db.js';
import { issueSession, requireAuth, revokeSession, type AuthedRequest } from '../middleware/auth.js';
import { verifyPassword, isPasswordRequired } from '../lib/password.js';

const router = Router();

const DEMO_USER_IDS = [
  'user-parent-bennett',
  'user-student-leo',
  'user-teacher-reed',
  'user-admin-shaw'
];

function publicUser(user: Record<string, unknown>) {
  const { passwordHash: _ph, ...safe } = user;
  return safe;
}

/** POST /api/auth/login  { email, password } */
router.post('/login', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  const db = readDb();
  const user = db.users.find((u) => String(u.email).toLowerCase() === email);
  if (!user) {
    res.status(401).json({
      error:
        'No active school account found with this email address. Please check spelling or contact the school office.'
    });
    return;
  }

  const mustCheckPassword = isPasswordRequired() || Boolean(user.passwordHash);

  if (mustCheckPassword) {
    if (!password) {
      res.status(401).json({ error: 'Password is required' });
      return;
    }
    if (!verifyPassword(password, user.passwordHash)) {
      res.status(401).json({
        error: 'Invalid email or password. Please try again or contact the school office.'
      });
      return;
    }
  }

  const updated = { ...user, lastLoginAt: new Date().toISOString() };
  db.users = db.users.map((u) => (u.id === user.id ? updated : u));
  writeDb(db);
  const token = issueSession(user.id);

  res.json({ token, user: publicUser(updated) });
});

/** POST /api/auth/demo  { userId } — disabled in production unless ALLOW_DEMO_LOGIN=true */
router.post('/demo', (req, res) => {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_LOGIN !== 'true') {
    res.status(403).json({ error: 'Demo login is disabled in production' });
    return;
  }

  const userId = String(req.body?.userId || '');
  const db = readDb();
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    res.status(404).json({ error: 'Demo user not found' });
    return;
  }
  const updated = { ...user, lastLoginAt: new Date().toISOString() };
  db.users = db.users.map((u) => (u.id === user.id ? updated : u));
  writeDb(db);
  const token = issueSession(user.id);
  res.json({ token, user: publicUser(updated) });
});

/** GET /api/auth/me */
router.get('/me', requireAuth, (req: AuthedRequest, res) => {
  res.json({ user: publicUser(req.user as Record<string, unknown>) });
});

/** POST /api/auth/logout */
router.post('/logout', requireAuth, (req: AuthedRequest, res) => {
  if (req.token) revokeSession(req.token);
  res.json({ success: true });
});

/** GET /api/auth/demo-accounts – empty in production */
router.get('/demo-accounts', (_req, res) => {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEMO_LOGIN !== 'true') {
    res.json({ accounts: [] });
    return;
  }
  const db = readDb();
  const demos = db.users
    .filter((u) => DEMO_USER_IDS.includes(u.id))
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      linkedEntities: u.linkedEntities
    }));
  res.json({ accounts: demos });
});

/** POST /api/auth/change-password  { currentPassword, newPassword } */
router.post('/change-password', requireAuth, (req: AuthedRequest, res) => {
  const currentPassword = String(req.body?.currentPassword || '');
  const newPassword = String(req.body?.newPassword || '');

  if (newPassword.length < 10) {
    res.status(400).json({ error: 'New password must be at least 10 characters' });
    return;
  }

  const db = readDb();
  const user = db.users.find((u) => u.id === req.user?.id);
  if (!user) {
    res.status(401).json({ error: 'User not found' });
    return;
  }

  if (user.passwordHash && !verifyPassword(currentPassword, user.passwordHash)) {
    res.status(401).json({ error: 'Current password is incorrect' });
    return;
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(newPassword, salt, 64).toString('hex');
  user.passwordHash = `scrypt:${salt}:${hash}`;
  db.users = db.users.map((u) => (u.id === user.id ? user : u));
  writeDb(db);

  res.json({ success: true });
});

export default router;
