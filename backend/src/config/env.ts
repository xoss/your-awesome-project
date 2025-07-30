import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32).optional(),
  MINIO_ENDPOINT: z.string().default('localhost:9000'),
  MINIO_ACCESS_KEY: z.string().default('minioadmin'),
  MINIO_SECRET_KEY: z.string().default('minioadmin'),
  TWILIO_SID: z.string().optional(),
  TWILIO_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  MAX_FILE_SIZE: z.string().transform(Number).default('5242880'),
  ALLOWED_FILE_TYPES: z.string().default('image/jpeg,image/png,image/webp,image/gif'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
  CORS_ORIGINS: z.string().default('http://localhost:3000')
})

export const env = envSchema.parse(process.env)

export type Env = z.infer<typeof envSchema>