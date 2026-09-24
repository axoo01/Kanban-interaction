import { prisma } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { RegisterInput, LoginInput, UpdateThemeInput } from '../validators/auth.validator.js';
import { AuthUser } from '../types/express.d.js';

export interface AuthResult {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    themePreference: string;
  };
  token: string;
}

export class AuthService {
  static async register(input: RegisterInput): Promise<AuthResult> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email }
    });

    if (existingUser) {
      const error: any = new Error('Email address already registered');
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await hashPassword(input.password);
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        fullName: input.fullName,
        themePreference: input.themePreference || 'dark'
      }
    });

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    };

    const token = generateToken(authUser);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        themePreference: user.themePreference
      },
      token
    };
  }

  static async login(input: LoginInput): Promise<AuthResult> {
    const user = await prisma.user.findUnique({
      where: { email: input.email }
    });

    if (!user) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await comparePassword(input.password, user.passwordHash);
    if (!isMatch) {
      const error: any = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role
    };

    const token = generateToken(authUser);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        themePreference: user.themePreference
      },
      token
    };
  }

  static async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        themePreference: true,
        createdAt: true
      }
    });

    if (!user) {
      const error: any = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  static async updateTheme(userId: string, input: UpdateThemeInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { themePreference: input.themePreference },
      select: {
        id: true,
        email: true,
        fullName: true,
        themePreference: true
      }
    });
    return user;
  }
}
