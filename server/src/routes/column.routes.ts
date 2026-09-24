import { Router } from 'express';
import { ColumnController } from '../controllers/column.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { updateColumnSchema } from '../validators/column.validator.js';

export const columnRouter = Router();

columnRouter.use(authenticateToken);

columnRouter.put('/:id', validateRequest(updateColumnSchema), ColumnController.updateColumn);
columnRouter.delete('/:id', ColumnController.deleteColumn);
