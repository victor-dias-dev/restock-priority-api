import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
  const Pipe = ZodValidationPipe(z.object({ name: z.string().min(1) }));
  const pipe = new Pipe();
  const metadata: ArgumentMetadata = { type: 'body' };

  it('returns the parsed payload', () => {
    expect(pipe.transform({ name: 'pad' }, metadata)).toEqual({ name: 'pad' });
  });

  it('throws BadRequestException when the payload is invalid', () => {
    expect(() => pipe.transform({ name: '' }, metadata)).toThrow(BadRequestException);
  });
});
