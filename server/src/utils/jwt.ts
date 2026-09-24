import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthUser } from '../types/express.d.js';

export interface JwtPayload extends AuthUser {
  iat?: number;
  exp?: number;
}

export const generateToken = (payload: AuthUser, expiresIn: string | number = '7d'): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: expiresIn as any });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};
