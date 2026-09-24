import { Request, Response } from 'express';
import { BoardService } from '../services/board.service.js';
import { ColumnService } from '../services/column.service.js';
import { ActivityService } from '../services/activity.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class BoardController {
  static createBoard = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', 401);
        return;
      }
      const board = await BoardService.createBoard(req.user.id, req.body);
      sendSuccess(res, board, 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to create board', error.statusCode || 400);
    }
  };

  static getBoards = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', 401);
        return;
      }
      const boards = await BoardService.getUserBoards(req.user.id);
      sendSuccess(res, boards, 200);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch boards', error.statusCode || 400);
    }
  };

  static getBoardById = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', 401);
        return;
      }
      const id = req.params.id as string;
      const board = await BoardService.getBoardById(id, req.user.id);
      sendSuccess(res, board, 200);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch board details', error.statusCode || 400);
    }
  };

  static updateBoard = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const board = await BoardService.updateBoard(id, req.body);
      sendSuccess(res, board, 200);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update board', error.statusCode || 400);
    }
  };

  static deleteBoard = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', 401);
        return;
      }
      const id = req.params.id as string;
      const result = await BoardService.deleteBoard(id, req.user.id);
      sendSuccess(res, result, 200);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to delete board', error.statusCode || 400);
    }
  };

  static addCollaborator = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const collaborator = await BoardService.addCollaborator(id, req.body);
      sendSuccess(res, collaborator, 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to add collaborator', error.statusCode || 400);
    }
  };

  static addColumn = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const column = await ColumnService.addColumn(id, req.body);
      sendSuccess(res, column, 201);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to add column to board', error.statusCode || 400);
    }
  };

  static getActivities = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, 'Authentication required', 401);
        return;
      }
      const id = req.params.id as string;
      const logs = await ActivityService.getBoardActivities(id, req.user.id);
      sendSuccess(res, logs, 200);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to fetch board activity logs', error.statusCode || 400);
    }
  };
}
