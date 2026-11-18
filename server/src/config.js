import 'dotenv/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().min(1),
  CORS_ORIGIN: z.string().default('*'),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  console.error('Invalid environment configuration:', result.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const config = result.data;
