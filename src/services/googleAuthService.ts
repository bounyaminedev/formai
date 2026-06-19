import { google } from 'googleapis';
import { env } from '../config/env.js';
import { getToken, upsertToken } from '../db/tokenRepository.js';

export const SCOPES = [
  'https://www.googleapis.com/auth/forms.body',
  'https://www.googleapis.com/auth/drive.file',
  // Needed to bind stored tokens to a stable MVP userId (the Google email address).
  'https://www.googleapis.com/auth/userinfo.email',
];

export function oauthClient() {
  return new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI);
}

export function getAuthUrl(): string {
  return oauthClient().generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    include_granted_scopes: true,
  });
}

export async function handleOAuthCallback(code: string): Promise<{ userId: string; email: string }> {
  const client = oauthClient();
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: 'v2', auth: client });
  const { data } = await oauth2.userinfo.get();

  if (!data.email || !tokens.access_token || !tokens.expiry_date) {
    throw new Error('OAuth callback missing token or email');
  }

  upsertToken({
    userId: data.email,
    email: data.email,
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token ?? '',
    expiryDate: tokens.expiry_date,
  });

  return { userId: data.email, email: data.email };
}

export async function authorizedClientForUser(userId: string) {
  const stored = getToken(userId);
  if (!stored) {
    throw new Error('Utilisateur non authentifié. Lancez GET /auth/google avant de générer un formulaire.');
  }

  const client = oauthClient();
  client.setCredentials({
    access_token: stored.accessToken,
    refresh_token: stored.refreshToken,
    expiry_date: stored.expiryDate,
  });

  if (Date.now() > stored.expiryDate - 60_000) {
    const { credentials } = await client.refreshAccessToken();
    const refreshed = {
      ...stored,
      accessToken: credentials.access_token ?? stored.accessToken,
      refreshToken: credentials.refresh_token ?? stored.refreshToken,
      expiryDate: credentials.expiry_date ?? stored.expiryDate,
    };

    upsertToken(refreshed);
    client.setCredentials({
      access_token: refreshed.accessToken,
      refresh_token: refreshed.refreshToken,
      expiry_date: refreshed.expiryDate,
    });
  }

  return client;
}
