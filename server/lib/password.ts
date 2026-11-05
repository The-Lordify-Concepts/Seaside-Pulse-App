/**
 * Password hashing with Node crypto.scrypt (no extra dependency).
 * Stored format: scrypt:<saltHex>:<hashHex>
 */
import crypto from 'crypto';

const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, KEYLEN).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string | undefined | null): boolean {
  if (!stored || typeof stored !== 'string') return false;
  const parts = stored.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, expected] = parts;
  if (!salt || !expected) return false;
  const actual = crypto.scryptSync(password, salt, KEYLEN).toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
  } catch {
    return false;
  }
}

/** Demo / seed accounts without a passwordHash still work only when ALLOW_DEMO_LOGIN=true */
export function isPasswordRequired(): boolean {
  if (process.env.ALLOW_DEMO_LOGIN === 'true') return false;
  return process.env.NODE_ENV === 'production';
}
