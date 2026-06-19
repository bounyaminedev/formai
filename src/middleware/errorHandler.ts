import type { ErrorRequestHandler } from 'express';
import { logger } from '../utils/logger.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  void _next;
  logger.error({ err }, 'Request failed');
  const message = err instanceof Error ? err.message : 'Erreur interne';
  const status = message.includes('non authentifié') ? 401 : message.includes('quota') || message.includes('429') ? 429 : 500;
  res.status(status).json({ error: message });
};
