import { z } from 'zod';

export const CreatePartSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.string().min(1).max(100),
  currentStock: z.number().int().nonnegative(),
  minimumStock: z.number().int().nonnegative(),
  averageDailySales: z.number().nonnegative(),
  leadTimeDays: z.number().int().nonnegative(),
  unitCost: z.number().positive(),
  criticalityLevel: z.number().int().min(1).max(5),
});

export type CreatePartDto = z.infer<typeof CreatePartSchema>;
