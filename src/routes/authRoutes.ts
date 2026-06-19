import { Router } from 'express';
import { env } from '../config/env.js';
import { getAuthUrl, handleOAuthCallback } from '../services/googleAuthService.js';

export const authRoutes = Router();

authRoutes.get('/google', (_req, res) => res.redirect(getAuthUrl()));

authRoutes.get('/google/callback', async (req, res, next) => {
  try {
    if (req.query.error) {
      const redirectUrl = new URL(env.FRONTEND_URL);
      redirectUrl.searchParams.set('auth', 'error');
      redirectUrl.searchParams.set('message', String(req.query.error));
      return res.redirect(redirectUrl.toString());
    }

    const code = String(req.query.code ?? '');
    if (!code) {
      return res.status(400).json({ error: 'Code OAuth manquant' });
    }

    const user = await handleOAuthCallback(code);
    if (req.query.format === 'json') {
      return res.json({ message: 'Authentification Google réussie', userId: user.userId, email: user.email });
    }

    const redirectUrl = new URL(env.FRONTEND_URL);
    redirectUrl.searchParams.set('auth', 'success');
    redirectUrl.searchParams.set('userId', user.userId);
    return res.redirect(redirectUrl.toString());
  } catch (error) {
    next(error);
  }
});
