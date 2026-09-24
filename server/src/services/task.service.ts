import { prisma } from '../config/database.js';
import { CreateTaskInput, UpdateTaskInput, MoveTaskInput } from '../validators/task.validator.js';
import { BoardRole } from '@prisma/client';
import { ActivityService } from './activity.service.js';

export class TaskService {
  private static async verifyBoardAccess(boardId: string, userId: string, allowedRoles: BoardRole[] = [BoardRole.OWNER, BoardRole.EDITOR]) {
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

    if (board.ownerId === userId) return board;

    const collaborator = board.collaborators[0];
    if (!collaborator || !allowedRoles.includes(collaborator.role)) {
      const error: any = new Error('Access denied to this board');
      error.statusCode = 403;
      throw error;
    }

    return board;
  }

  static async createTask(userId: string, input: CreateTaskInput) {
    const column = await prisma.column.findUnique({
      where: { id: input.columnId }
    });

    if (!column) {
      const error: any = new Error('Column not found');
      error.statusCode = 404;
      throw error;
    }

    await this.verifyBoardAccess(column.boardId, userId);

    const taskCount = await prisma.task.count({
      where: { columnId: input.columnId }
    });

    const subtasksData = input.subtasks?.map((subtask, index) => ({
      title: subtask.title,
      isCompleted: subtask.isCompleted || false,
      position: index
    })) || [];

    const task = await prisma.task.create({
      data: {
        columnId: input.columnId,
        title: input.title,
        description: input.description,
        status: column.name,
        position: taskCount,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        assigneeId: input.assigneeId,
        subtasks: {
          create: subtasksData
        }
      },
      include: {
        subtasks: {
          orderBy: { position: 'asc' }
        },
        assignee: {
          select: { id: true, email: true, fullName: true }
        }
      }
    });

    await ActivityService.logActivity(column.boardId, userId, 'TASK_CREATED', `Created task "${task.title}"`);

    return task;
  }

  static async getTaskById(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        column: true,
        subtasks: {
          orderBy: { position: 'asc' }
        },
        assignee: {
          select: { id: true, email: true, fullName: true }
        }
      }
    });

    if (!task) {
      const error: any = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    await this.verifyBoardAccess(task.column.boardId, userId, [BoardRole.OWNER, BoardRole.EDITOR, BoardRole.VIEWER]);

    return task;
  }

  static async updateTask(taskId: string, userId: string, input: UpdateTaskInput) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { column: true }
    });

    if (!task) {
      const error: any = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    await this.verifyBoardAccess(task.column.boardId, userId);

    const updateData: any = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.dueDate !== undefined) updateData.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    if (input.assigneeId !== undefined) updateData.assigneeId = input.assigneeId;

    if (input.subtasks) {
      await prisma.subtask.deleteMany({
        where: { taskId }
      });
      updateData.subtasks = {
        create: input.subtasks.map((s, index) => ({
          title: s.title,
          isCompleted: s.isCompleted || false,
          position: index
        }))
      };
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        subtasks: {
          orderBy: { position: 'asc' }
        },
        assignee: {
          select: { id: true, email: true, fullName: true }
        }
      }
    });

    return updatedTask;
  }

  static async deleteTask(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { column: true }
    });

    if (!task) {
      const error: any = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    await this.verifyBoardAccess(task.column.boardId, userId);

    await prisma.$transaction([
      prisma.task.delete({
        where: { id: taskId }
      }),
      prisma.task.updateMany({
        where: {
          columnId: task.columnId,
          position: { gt: task.position }
        },
        data: {
          position: { decrement: 1 }
        }
      })
    ]);

    return { id: taskId };
  }

  static async moveTask(taskId: string, userId: string, input: MoveTaskInput) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { column: true }
    });

    if (!task) {
      const error: any = new Error('Task not found');
      error.statusCode = 404;
      throw error;
    }

    await this.verifyBoardAccess(task.column.boardId, userId);

    const targetColumn = await prisma.column.findUnique({
      where: { id: input.targetColumnId }
    });

    if (!targetColumn) {
      const error: any = new Error('Target column not found');
      error.statusCode = 404;
      throw error;
    }

    if (targetColumn.boardId !== task.column.boardId) {
      const error: any = new Error('Target column belongs to a different board');
      error.statusCode = 400;
      throw error;
    }

    const oldPosition = task.position;
    const newPosition = input.newPosition;

    if (task.columnId === input.targetColumnId) {
      if (oldPosition === newPosition) {
        return this.getTaskById(taskId, userId);
      }

      if (newPosition > oldPosition) {
        await prisma.$transaction([
          prisma.task.updateMany({
            where: {
              columnId: task.columnId,
              position: { gt: oldPosition, lte: newPosition }
            },
            data: { position: { decrement: 1 } }
          }),
          prisma.task.update({
            where: { id: taskId },
            data: { position: newPosition }
          })
        ]);
      } else {
        await prisma.$transaction([
          prisma.task.updateMany({
            where: {
              columnId: task.columnId,
              position: { gte: newPosition, lt: oldPosition }
            },
            data: { position: { increment: 1 } }
          }),
          prisma.task.update({
            where: { id: taskId },
            data: { position: newPosition }
          })
        ]);
      }
    } else {
      await prisma.$transaction([
        prisma.task.updateMany({
          where: {
            columnId: task.columnId,
            position: { gt: oldPosition }
          },
          data: { position: { decrement: 1 } }
        }),
        prisma.task.updateMany({
          where: {
            columnId: input.targetColumnId,
            position: { gte: newPosition }
          },
          data: { position: { increment: 1 } }
        }),
        prisma.task.update({
          where: { id: taskId },
          data: {
            columnId: input.targetColumnId,
            status: targetColumn.name,
            position: newPosition
          }
        })
      ]);
    }

    await ActivityService.logActivity(
      task.column.boardId,
      userId,
      'TASK_MOVED',
      `Moved task "${task.title}" to column "${targetColumn.name}" at position ${newPosition}`
    );

    return this.getTaskById(taskId, userId);
  }
}
