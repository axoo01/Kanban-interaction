import { pino } from 'pino';
import { env } from '../config/env.js';

let transport;
if (env.NODE_ENV === 'development') {
  try {
    transport = pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'SYS:standard'
      }
    });
  } catch (err) {
    console.warn('pino-pretty transport not available, falling back to standard JSON logs');
  }
}

export const logger = pino(
  {
    level: env.NODE_ENV === 'test' ? 'silent' : 'info'
  },
  transport
);
