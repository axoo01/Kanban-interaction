import { prisma } from '../config/database.js';
import { CreateBoardInput, UpdateBoardInput, AddCollaboratorInput } from '../validators/board.validator.js';
import { BoardRole } from '@prisma/client';

export class BoardService {
  static async createBoard(userId: string, input: CreateBoardInput) {
    const columnsData = input.columns?.map((col, index) => ({
      name: col.name,
      position: index
    })) || [];

    const board = await prisma.board.create({
      data: {
        name: input.name,
        ownerId: userId,
        collaborators: {
          create: {
            userId,
            role: BoardRole.OWNER
          }
        },
        columns: {
          create: columnsData
        }
      },
      include: {
        columns: {
          orderBy: { position: 'asc' }
        },
        collaborators: true
      }
    });

    return board;
  }

  static async getUserBoards(userId: string) {
    const boards = await prisma.board.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { collaborators: { some: { userId } } }
        ]
      },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              orderBy: { position: 'asc' },
              include: {
                subtasks: {
                  orderBy: { position: 'asc' }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return boards;
  }

  static async getBoardById(boardId: string, userId: string) {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        collaborators: {
          include: {
            user: {
              select: { id: true, email: true, fullName: true }
            }
          }
        },
        columns: {
          orderBy: { position: 'asc' },
          include: {
            tasks: {
              orderBy: { position: 'asc' },
              include: {
                subtasks: {
                  orderBy: { position: 'asc' }
                }
              }
            }
          }
        }
      }
    });

    if (!board) {
      const error: any = new Error('Board not found');
      error.statusCode = 404;
      throw error;
    }

    const isOwner = board.ownerId === userId;
    const isCollaborator = board.collaborators.some((c) => c.userId === userId);

    if (!isOwner && !isCollaborator) {
      const error: any = new Error('Access denied to this board');
      error.statusCode = 403;
      throw error;
    }

    return board;
  }

  static async updateBoard(boardId: string, input: UpdateBoardInput) {
    const updated = await prisma.board.update({
      where: { id: boardId },
      data: { name: input.name }
    });
    return updated;
  }

  static async deleteBoard(boardId: string, userId: string) {
    const board = await prisma.board.findUnique({
      where: { id: boardId }
    });

    if (!board) {
      const error: any = new Error('Board not found');
      error.statusCode = 404;
      throw error;
    }

    if (board.ownerId !== userId) {
      const error: any = new Error('Only the board owner can delete this board');
      error.statusCode = 403;
      throw error;
    }

    await prisma.board.delete({
      where: { id: boardId }
    });

    return { id: boardId };
  }

  static async addCollaborator(boardId: string, input: AddCollaboratorInput) {
    const targetUser = await prisma.user.findUnique({
      where: { email: input.email }
    });

    if (!targetUser) {
      const error: any = new Error('User with specified email not found');
      error.statusCode = 404;
      throw error;
    }

    const collaborator = await prisma.boardCollaborator.upsert({
      where: {
        boardId_userId: {
          boardId,
          userId: targetUser.id
        }
      },
      update: {
        role: input.role
      },
      create: {
        boardId,
        userId: targetUser.id,
        role: input.role
      },
      include: {
        user: {
          select: { id: true, email: true, fullName: true }
        }
      }
    });

    return collaborator;
  }
}
