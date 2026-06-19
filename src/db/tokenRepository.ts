import { db } from './database.js';

export type StoredToken = { userId: string; email: string; accessToken: string; refreshToken: string; expiryDate: number };

type Row = { user_id: string; email: string; access_token: string; refresh_token: string; expiry_date: number };
const toStored = (r: Row): StoredToken => ({ userId: r.user_id, email: r.email, accessToken: r.access_token, refreshToken: r.refresh_token, expiryDate: r.expiry_date });

export function upsertToken(token: StoredToken): void {
  db.prepare(`INSERT INTO oauth_tokens (user_id,email,access_token,refresh_token,expiry_date,updated_at) VALUES (@userId,@email,@accessToken,@refreshToken,@expiryDate,CURRENT_TIMESTAMP)
  ON CONFLICT(user_id) DO UPDATE SET email=excluded.email, access_token=excluded.access_token, refresh_token=COALESCE(NULLIF(excluded.refresh_token,''),oauth_tokens.refresh_token), expiry_date=excluded.expiry_date, updated_at=CURRENT_TIMESTAMP`).run(token);
}
export function getToken(userId: string): StoredToken | undefined { const row = db.prepare('SELECT * FROM oauth_tokens WHERE user_id = ?').get(userId) as Row | undefined; return row && toStored(row); }
