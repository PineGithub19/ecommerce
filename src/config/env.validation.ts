import z from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(8080), // Coerce -> force to be a type

  // CORS
  CLIENT_URL: z.string().trim().min(1),
  CORS_OTHER_URL: z.string().trim().optional(),

  // Database
  DB_HOST: z
    .string()
    .min(1, { message: 'DB_HOST is required' })
    .default('localhost'),
  DB_PORT: z.coerce.number().default(5432),
  DB_USERNAME: z
    .string()
    .min(1, { message: 'DB_USERNAME is required' })
    .default('postgres'),
  DB_PASSWORD: z
    .string()
    .min(1, { message: 'DB_PASSWORD is required' })
    .default('postgres'),
  DB_NAME: z
    .string()
    .min(1, { message: 'DB_NAME is required' })
    .default('ecommerce'),
  // DB_POOL_MAX: z.coerce.number().default(10),
  // DB_POOL_MIN: z.coerce.number().default(2),
  // DB_POOL_CONNECTION_TIMEOUT_MS: z.coerce.number().default(5000),
  // DB_POOL_IDLE_TIMEOUT_MS: z.coerce.number().default(30000),

  // // Throttler
  // THROTTLE_TTL_MS: z.coerce.number().default(1000),
  // THROTTLE_LIMIT: z.coerce.number().default(60),

  // // Email (SMTP)
  // SMTP_USER: z.email(),
  // SMTP_PASS: z.string().min(1),
  // SMTP_FROM: z.email(),

  // BETTER_AUTH_SECRET: z.string().min(32),

  // // Internal API
  // INTERNAL_API_SECRET: z.string().min(32),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => {
        return `${issue.path.join('.')} - ${issue.message}`;
      })
      .join('\n');
    throw new Error(`Invalid environment configuration: \n${issues}`);
  }

  return parsed.data;
}
