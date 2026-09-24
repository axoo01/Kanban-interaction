import { z } from 'zod';
import { BoardRole } from '@prisma/client';

export const createBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required'),
  columns: z
    .array(
      z.object({
        name: z.string().min(1, 'Column name is required')
      })
    )
    .optional()
});

export const updateBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required')
});

export const addCollaboratorSchema = z.object({
  email: z.string().email('Invalid email address format'),
  role: z.nativeEnum(BoardRole)
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type AddCollaboratorInput = z.infer<typeof addCollaboratorSchema>;
