import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { authRoutes } from './routes/authRoutes.js';
import { formsRoutes } from './routes/formsRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

export const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(pinoHttp({ logger }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/auth', authRoutes);
app.use('/forms', formsRoutes);
app.use(errorHandler);
