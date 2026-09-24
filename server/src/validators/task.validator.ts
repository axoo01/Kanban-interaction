import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  columnId: z.string().min(1, 'Column identifier is required'),
  dueDate: z.string().datetime().optional().nullable(),
  assigneeId: z.string().min(1).optional().nullable(),
  subtasks: z
    .array(
      z.object({
        title: z.string().min(1, 'Subtask title is required'),
        isCompleted: z.boolean().optional()
      })
    )
    .optional()
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  status: z.string().optional(),
  dueDate: z.string().datetime().optional().nullable(),
  assigneeId: z.string().min(1).optional().nullable(),
  subtasks: z
    .array(
      z.object({
        title: z.string().min(1),
        isCompleted: z.boolean().optional()
      })
    )
    .optional()
});

export const moveTaskSchema = z.object({
  targetColumnId: z.string().min(1, 'Target column identifier is required'),
  newPosition: z.number().int().min(0, 'Position must be a non-negative integer')
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
