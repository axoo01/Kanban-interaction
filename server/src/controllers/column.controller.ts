import { Request, Response } from 'express';
import { ColumnService } from '../services/column.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class ColumnController {
  static updateColumn = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const column = await ColumnService.updateColumn(id, req.body);
      sendSuccess(res, column, 200);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to update column', error.statusCode || 400);
    }
  };

  static deleteColumn = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id as string;
      const result = await ColumnService.deleteColumn(id);
      sendSuccess(res, result, 200);
    } catch (error: any) {
      sendError(res, error.message || 'Failed to delete column', error.statusCode || 400);
    }
  };
}
