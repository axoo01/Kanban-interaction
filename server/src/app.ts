import express from 'express';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import { logger } from './utils/logger.js';
import { sendSuccess } from './utils/response.js';
import { authRouter } from './routes/auth.routes.js';

export const app = express();

app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV !== 'test') {
  app.use(pinoHttp({ logger }));
}

app.get('/health', (_req, res) => {
  sendSuccess(res, { status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/auth', authRouter);

app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});
