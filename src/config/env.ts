import 'dotenv/config';
import { z } from 'zod';

const booleanFromEnv = z.preprocess((value) => {
  if (value === undefined) return false;
  if (typeof value === 'boolean') return value;
  return value === 'true';
}, z.boolean());

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  GEMINI_API_KEY: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().url(),
  SQLITE_PATH: z.string().default('./formai.sqlite'),
  APP_BASE_URL: z.string().url().default('http://localhost:3000'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  MOCK_EXTERNAL_APIS: booleanFromEnv.default(false),
});

export const env = envSchema.parse(process.env);
