import { prisma } from '../config/database.js';

export class ActivityService {
  static async logActivity(boardId: string, userId: string, action: string, details?: string) {
    try {
      await prisma.activityLog.create({
        data: {
          boardId,
          userId,
          action,
          details
        }
      });
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  }

  static async getBoardActivities(boardId: string, userId: string) {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        collaborators: {
          where: { userId }
        }
      }
    });

    if (!board) {
      const error: any = new Error('Board not found');
      error.statusCode = 404;
      throw error;
    }

    const isOwner = board.ownerId === userId;
    const isCollaborator = board.collaborators.length > 0;

    if (!isOwner && !isCollaborator) {
      const error: any = new Error('Access denied to this board');
      error.statusCode = 403;
      throw error;
    }

    const logs = await prisma.activityLog.findMany({
      where: { boardId },
      include: {
        user: {
          select: { id: true, email: true, fullName: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return logs;
  }
}
