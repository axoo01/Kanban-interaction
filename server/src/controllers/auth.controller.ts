import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class AuthController {
  static register = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await AuthService.register(req.body);
      sendSuccess(res, result, 201);
    } catch (error: any) {
      sendError(res, error.message || 'Registration failed', error.statusCode || 400);
    }
  };

  static login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await AuthService.login(req.body);
      sendSuccess(res, result, 200);
    } catch (error: any) {
      sendError(res, error.message || 'Login failed', error.statusCode || 400);
    }
  };

  static getMe = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', 401);
        return;
      }
      const user = await AuthService.getMe(req.user.id);
      sendSuccess(res, user, 200);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to retrieve profile', error.statusCode || 400);
    }
  };

  static updateTheme = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', 401);
        return;
      }
      const updatedUser = await AuthService.updateTheme(req.user.id, req.body);
      sendSuccess(res, updatedUser, 200);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update theme preference', error.statusCode || 400);
    }
  };
}
