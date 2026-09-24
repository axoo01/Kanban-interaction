import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    sendError(res, 'Authentication token required', 401);
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.id,
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role
    };
    next();
  } catch (err) {
    sendError(res, 'Invalid or expired token', 401);
    return;
  }
};
