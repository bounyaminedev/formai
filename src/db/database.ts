import Database from 'better-sqlite3';
import { env } from '../config/env.js';

export const db = new Database(env.SQLITE_PATH);

db.exec(`
CREATE TABLE IF NOT EXISTS oauth_tokens (
  user_id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expiry_date INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS gemini_usage (
  usage_date TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL DEFAULT 0
);
`);
