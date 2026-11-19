// Zod checks and converts values sent by a client before they reach Prisma.
import { z } from 'zod';
import { HttpError } from './errors.js';

// These are the query-string options accepted by GET /api/films.
export const filmQuerySchema = z.object({
  // trim() removes accidental spaces; max() prevents extremely large input.
  search: z.string().trim().max(100).optional(),
  title: z.string().trim().max(100).optional(),
  genre: z.string().trim().max(80).optional(),
  department: z.string().trim().max(120).optional(),

  // Query strings arrive as text. coerce converts values such as '2025' to
  // the number 2025 before checking that the year is inside a sensible range.
  year: z.coerce.number().int().min(1900).max(2100).optional(),

  // Pagination defaults mean callers may omit page and limit entirely.
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
// strict() rejects misspelled or unsupported query parameters.
}).strict();

// A shared helper for parsing any Zod schema used by the server.
export function parse(schema, input) {
  // safeParse returns a result object instead of immediately throwing.
  const result = schema.safeParse(input);
  if (!result.success) {
    // Convert Zod's validation result into the API's standard error format.
    throw new HttpError(400, 'Invalid request parameters.', result.error.flatten().fieldErrors);
  }

  // `data` contains validated values and any conversions/defaults from above.
  return result.data;
}
