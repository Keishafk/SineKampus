import { z } from 'zod';
import { HttpError } from './errors.js';

export const filmQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  title: z.string().trim().max(100).optional(),
  genre: z.string().trim().max(80).optional(),
  department: z.string().trim().max(120).optional(),
  year: z.coerce.number().int().min(1900).max(2100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

export function parse(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new HttpError(400, 'Invalid request parameters.', result.error.flatten().fieldErrors);
  }
  return result.data;
}
