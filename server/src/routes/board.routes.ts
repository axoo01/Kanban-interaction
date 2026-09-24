import { Router } from 'express';
import { BoardController } from '../controllers/board.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireBoardAccess } from '../middleware/rbac.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createBoardSchema, updateBoardSchema, addCollaboratorSchema } from '../validators/board.validator.js';
import { createColumnSchema } from '../validators/column.validator.js';
import { BoardRole } from '@prisma/client';

export const boardRouter = Router();

boardRouter.use(authenticateToken);

boardRouter.get('/', BoardController.getBoards);
boardRouter.post('/', validateRequest(createBoardSchema), BoardController.createBoard);

boardRouter.get('/:id', BoardController.getBoardById);
boardRouter.get('/:id/activities', BoardController.getActivities);
boardRouter.put('/:id', requireBoardAccess(BoardRole.OWNER, BoardRole.EDITOR), validateRequest(updateBoardSchema), BoardController.updateBoard);
boardRouter.delete('/:id', requireBoardAccess(BoardRole.OWNER), BoardController.deleteBoard);

boardRouter.post('/:id/collaborators', requireBoardAccess(BoardRole.OWNER), validateRequest(addCollaboratorSchema), BoardController.addCollaborator);
boardRouter.post('/:id/columns', requireBoardAccess(BoardRole.OWNER, BoardRole.EDITOR), validateRequest(createColumnSchema), BoardController.addColumn);
