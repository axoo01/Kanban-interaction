import { prisma } from '../config/database.js';
import { CreateColumnInput, UpdateColumnInput } from '../validators/column.validator.js';

export class ColumnService {
  static async addColumn(boardId: string, input: CreateColumnInput) {
    const existingColumns = await prisma.column.findMany({
      where: { boardId },
      orderBy: { position: 'desc' },
      take: 1
    });

    const nextPosition = existingColumns.length > 0 ? existingColumns[0].position + 1 : 0;

    const column = await prisma.column.create({
      data: {
        boardId,
        name: input.name,
        position: nextPosition
      }
    });

    return column;
  }

  static async updateColumn(columnId: string, input: UpdateColumnInput) {
    const column = await prisma.column.update({
      where: { id: columnId },
      data: { name: input.name }
    });
    return column;
  }

  static async deleteColumn(columnId: string) {
    const column = await prisma.column.findUnique({
      where: { id: columnId }
    });

    if (!column) {
      const error: any = new Error('Column not found');
      error.statusCode = 404;
      throw error;
    }

    await prisma.$transaction([
      prisma.column.delete({
        where: { id: columnId }
      }),
      prisma.column.updateMany({
        where: {
          boardId: column.boardId,
          position: { gt: column.position }
        },
        data: {
          position: { decrement: 1 }
        }
      })
    ]);

    return { id: columnId };
  }
}
