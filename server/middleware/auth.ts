import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { readDb, writeDb } from '../db.js';

const SECRET = process.env.PULSE_SESSION_SECRET || 'seaside-pulse-dev-secret-change-me';
const SESSION_HOURS = 72;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  linkedEntities: Record<string, unknown>;
  avatarInitials?: string;
}

export interface AuthedRequest extends Request {
  user?: AuthUser;
  token?: string;
}

export function createSessionToken(userId: string): string {
  const payload = `${userId}.${Date.now()}.${crypto.randomBytes(8).toString('hex')}`;
  const sig = crypto.createHmac('sha256', SECRET).update(payload).digest('hex').slice(0, 24);
  return Buffer.from(`${payload}.${sig}`).toString('base64url');
}

export function issueSession(userId: string): string {
  const token = createSessionToken(userId);
  const db = readDb();
  const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600 * 1000).toISOString();
  db.sessions = db.sessions.filter((s) => new Date(s.expiresAt) > new Date());
  db.sessions.push({ token, userId, expiresAt });
  writeDb(db);
  return token;
}

export function revokeSession(token: string): void {
  const db = readDb();
  db.sessions = db.sessions.filter((s) => s.token !== token);
  writeDb(db);
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const db = readDb();
  const session = db.sessions.find((s) => s.token === token);
  if (!session || new Date(session.expiresAt) <= new Date()) {
    res.status(401).json({ error: 'Session expired or invalid' });
    return;
  }

  const user = db.users.find((u) => u.id === session.userId);
  if (!user) {
    res.status(401).json({ error: 'User not found' });
    return;
  }

  const { passwordHash: _ph, ...safeUser } = user as Record<string, unknown>;
  req.user = safeUser as AuthUser;
  req.token = token;
  next();
}

export function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (token) {
    const db = readDb();
    const session = db.sessions.find((s) => s.token === token && new Date(s.expiresAt) > new Date());
    if (session) {
      const user = db.users.find((u) => u.id === session.userId);
      if (user) {
        req.user = user as AuthUser;
        req.token = token;
      }
    }
  }
  next();
}
