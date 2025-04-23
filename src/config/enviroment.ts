import z from 'zod';

const schema = z.object({
  PORT: z.string(),
  MONGODB_URI: z.string(),
  JWT_SECRET: z.string(),
  EMAIL_USER: z.string(),
  EMAIL_PASSWORD: z.string(),
  PASSWORD_RESET_URL: z.string()
})

export const env = schema.parse(process.env);

