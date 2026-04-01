import { z } from 'zod';
import { CreatePartSchema } from './create-part-dto';

export const UpdatePartSchema = CreatePartSchema.partial();

export type UpdatePartDto = z.infer<typeof UpdatePartSchema>;
