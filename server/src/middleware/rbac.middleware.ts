import { Request, Response, NextFunction } from 'express';
import { GlobalRole, BoardRole } from '@prisma/client';
import { prisma } from '../config/database.js';
import { sendError } from '../utils/response.js';

export const requireGlobalRole = (...allowedRoles: GlobalRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendError(res, 'Insufficient permissions', 403);
      return;
    }

    next();
  };
};

export const requireBoardAccess = (...allowedRoles: BoardRole[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      sendError(res, 'Authentication required', 401);
      return;
    }

    const rawId = req.params.boardId || req.params.id;
    if (!rawId || typeof rawId !== 'string') {
      sendError(res, 'Board identifier is required', 400);
      return;
    }

    const board = await prisma.board.findUnique({
      where: { id: rawId },
      include: {
        collaborators: {
          where: { userId: req.user.id }
        }
      }
    });

    if (!board) {
      sendError(res, 'Board not found', 404);
      return;
    }

    if (board.ownerId === req.user.id) {
      next();
      return;
    }

    const collaborators = (board as any).collaborators as Array<{ role: BoardRole }>;
    const collaborator = collaborators && collaborators[0];

    if (!collaborator || !allowedRoles.includes(collaborator.role)) {
      sendError(res, 'Access denied to this board', 403);
      return;
    }

    next();
  };
};
