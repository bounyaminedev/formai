import { Router } from 'express';
import { getAuthUrl, handleOAuthCallback } from '../services/googleAuthService.js';

export const authRoutes = Router();
authRoutes.get('/google', (_req, res) => res.redirect(getAuthUrl()));
authRoutes.get('/google/callback', async (req, res, next) => {
  try {
    if (req.query.error) return res.status(400).json({ error: `Consentement refusé: ${req.query.error}` });
    const code = String(req.query.code ?? '');
    if (!code) return res.status(400).json({ error: 'Code OAuth manquant' });
    const user = await handleOAuthCallback(code);
    res.json({ message: 'Authentification Google réussie', userId: user.userId, email: user.email });
  } catch (error) { next(error); }
});
