import { z } from 'zod';

export const createColumnSchema = z.object({
  name: z.string().min(1, 'Column name is required')
});

export const updateColumnSchema = z.object({
  name: z.string().min(1, 'Column name is required')
});

export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
