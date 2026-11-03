import { Router } from 'express';
import { readDb, writeDb } from '../db.js';
import { issueSession, requireAuth, revokeSession, type AuthedRequest } from '../middleware/auth.js';

const router = Router();

/** POST /api/auth/login  { email, password? } */
router.post('/login', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email) {
    res.status(400).json({ error: 'Email is required' });
    return;
  }

  const db = readDb();
  const user = db.users.find((u) => String(u.email).toLowerCase() === email);
  if (!user) {
    res.status(401).json({
      error: 'No active school account found with this email address. Please check spelling or contact the school office.'
    });
    return;
  }

  // Demo mode: password is not enforced yet. Wire real password hashes next.
  const updated = { ...user, lastLoginAt: new Date().toISOString() };
  db.users = db.users.map((u) => (u.id === user.id ? updated : u));
  writeDb(db);
  const token = issueSession(user.id);

  res.json({ token, user: updated });
});

/** POST /api/auth/demo  { userId } */
router.post('/demo', (req, res) => {
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
  res.json({ token, user: updated });
});

/** GET /api/auth/me */
router.get('/me', requireAuth, (req: AuthedRequest, res) => {
  res.json({ user: req.user });
});

/** POST /api/auth/logout */
router.post('/logout', requireAuth, (req: AuthedRequest, res) => {
  if (req.token) revokeSession(req.token);
  res.json({ success: true });
});

/** GET /api/auth/demo-accounts – public list for login page */
router.get('/demo-accounts', (_req, res) => {
  const db = readDb();
  const demos = db.users
    .filter((u) =>
      ['user-parent-bennett', 'user-student-leo', 'user-teacher-reed', 'user-admin-shaw'].includes(u.id)
    )
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      linkedEntities: u.linkedEntities
    }));
  res.json({ accounts: demos });
});

export default router;
