import z from 'zod';

const schema = z.object({
  PORT: z.string(),
  DB_HOST: z.string(),
  DB_PORT: z.string().transform(val => parseInt(val)),
  DB_USERNAME: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_SSL: z.string(),
  JWT_SECRET: z.string(),
  EMAIL_USER: z.string(),
  EMAIL_PASSWORD: z.string(),
  PASSWORD_RESET_URL: z.string(),
  ALLOWED_ORIGIN: z.string(),
  SENTRY_DSN: z.string().optional(),
  NODE_ENV: z.string().default('development')
})

export const env = schema.parse(process.env);

