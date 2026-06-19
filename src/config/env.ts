import 'dotenv/config';
import { z } from 'zod';

const booleanFromEnv = z
  .enum(['true', 'false'])
  .optional()
  .transform((value) => value === 'true');

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  GEMINI_API_KEY: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().url(),
  SQLITE_PATH: z.string().default('./formai.sqlite'),
  APP_BASE_URL: z.string().url().default('http://localhost:3000'),
  MOCK_EXTERNAL_APIS: booleanFromEnv.default(false),
});

export const env = envSchema.parse(process.env);
