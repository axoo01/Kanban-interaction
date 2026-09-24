import { Router } from 'express';
import { TaskController } from '../controllers/task.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createTaskSchema, updateTaskSchema, moveTaskSchema } from '../validators/task.validator.js';

export const taskRouter = Router();

taskRouter.use(authenticateToken);

taskRouter.post('/', validateRequest(createTaskSchema), TaskController.createTask);
taskRouter.get('/:id', TaskController.getTaskById);
taskRouter.put('/:id', validateRequest(updateTaskSchema), TaskController.updateTask);
taskRouter.delete('/:id', TaskController.deleteTask);
taskRouter.patch('/:id/move', validateRequest(moveTaskSchema), TaskController.moveTask);
