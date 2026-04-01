import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodSchema } from 'zod';

export function ZodValidationPipe(schema: ZodSchema): new () => PipeTransform {
  class ZodPipe implements PipeTransform {
    transform(value: unknown) {
      const result = schema.safeParse(value);
      if (!result.success) {
        throw new BadRequestException(result.error.flatten());
      }
      return result.data;
    }
  }
  return ZodPipe;
}
