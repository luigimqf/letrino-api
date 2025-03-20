import z from 'zod';

const schema = z.object({
  PORT: z.string(),
  MONGODB_URI: z.string(),
  JWT_SECRET: z.string(),
})

export const env = schema.parse(process.env);

