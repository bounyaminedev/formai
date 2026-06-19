import { db } from './database.js';

export function incrementGeminiUsage(date = new Date()): number {
  const key = date.toISOString().slice(0, 10);
  db.prepare('INSERT INTO gemini_usage (usage_date, request_count) VALUES (?, 0) ON CONFLICT DO NOTHING').run(key);
  db.prepare('UPDATE gemini_usage SET request_count = request_count + 1 WHERE usage_date = ?').run(key);
  return (db.prepare('SELECT request_count FROM gemini_usage WHERE usage_date = ?').get(key) as { request_count: number }).request_count;
}
