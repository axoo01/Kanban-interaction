import { Request, Response } from 'express';
import { TaskService } from '../services/task.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class TaskController {
  static createTask = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', 401);
        return;
      }
      const task = await TaskService.createTask(req.user.id, req.body);
      sendSuccess(res, task, 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create task', error.statusCode || 400);
    }
  };

  static getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', 401);
        return;
      }
      const id = req.params.id as string;
      const task = await TaskService.getTaskById(id, req.user.id);
      sendSuccess(res, task, 200);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch task', error.statusCode || 400);
    }
  };

  static updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', 401);
        return;
      }
      const id = req.params.id as string;
      const task = await TaskService.updateTask(id, req.user.id, req.body);
      sendSuccess(res, task, 200);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update task', error.statusCode || 400);
    }
  };

  static deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', 401);
        return;
      }
      const id = req.params.id as string;
      const result = await TaskService.deleteTask(id, req.user.id);
      sendSuccess(res, result, 200);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to delete task', error.statusCode || 400);
    }
  };

  static moveTask = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', 401);
        return;
      }
      const id = req.params.id as string;
      const task = await TaskService.moveTask(id, req.user.id, req.body);
      sendSuccess(res, task, 200);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to move task', error.statusCode || 400);
    }
  };
}
