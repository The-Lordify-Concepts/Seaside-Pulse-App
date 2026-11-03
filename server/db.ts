/**
 * PULSE – lightweight JSON file store
 * Swap this module for Postgres / Prisma later without changing routes.
 *
 * DATA_DIR: override storage path for persistent volumes on Railway/Render/Fly
 *   e.g. DATA_DIR=/data
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(__dirname, 'data');

export const DB_FILE = path.join(DATA_DIR, 'pulse-db.json');

export interface DbShape {
  users: any[];
  families: any[];
  students: any[];
  parents: any[];
  teachers: any[];
  classes: any[];
  activities: any[];
  messages: any[];
  corrections: any[];
  categoryRules: any[];
  auditLogs: any[];
  sessions: { token: string; userId: string; expiresAt: string }[];
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function dbExists(): boolean {
  return fs.existsSync(DB_FILE);
}

export function readDb(): DbShape {
  ensureDir();
  if (!fs.existsSync(DB_FILE)) {
    throw new Error('Database not seeded. Run: npm run server:seed');
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8')) as DbShape;
}

export function writeDb(db: DbShape): void {
  ensureDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

export function withDb<T>(mutator: (db: DbShape) => T): T {
  const db = readDb();
  const result = mutator(db);
  writeDb(db);
  return result;
}

export function id(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
