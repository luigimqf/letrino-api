import z from 'zod';
import dotenv from 'dotenv';
import path from 'path';

const nodeEnv = process.env.NODE_ENV ?? 'development';

const envFile = `.env.${nodeEnv}`;

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const schema = z.object({
  PORT: z.string(),
  DB_URL: z.string(),
  DB_SSL: z.string().optional(),
  JWT_SECRET: z.string(),
  EMAIL_USER: z.string(),
  EMAIL_PASSWORD: z.string(),
  PASSWORD_RESET_URL: z.string(),
  ALLOWED_ORIGIN: z.string(),
  SENTRY_DSN: z.string().optional(),
  NODE_ENV: z.string().default('development'),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_SIGN_IN_REDIRECT_URI: z.string(),
  GOOGLE_SIGN_UP_REDIRECT_URI: z.string(),
});

const _env = schema.safeParse(process.env);

if (_env.success === false) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables.');
}

export const env = _env.data;
