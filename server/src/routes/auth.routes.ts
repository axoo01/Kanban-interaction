import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

export const authRouter = Router();

authRouter.post('/register', validateRequest(registerSchema), AuthController.register);
authRouter.post('/login', validateRequest(loginSchema), AuthController.login);
authRouter.get('/me', authenticateToken, AuthController.getMe);
