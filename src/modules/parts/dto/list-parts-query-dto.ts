import { z } from 'zod';

const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value);

export const ListPartsQuerySchema = z.object({
  category: z.preprocess(emptyToUndefined, z.string().min(1).max(100).optional()),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type ListPartsQueryDto = z.infer<typeof ListPartsQuerySchema>;
