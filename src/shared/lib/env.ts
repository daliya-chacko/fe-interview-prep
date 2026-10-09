import { z } from 'zod';

/**
 * Validated runtime configuration. Fails fast at module load if the environment
 * is misconfigured, instead of surfacing as confusing errors deep in the app.
 */
const envSchema = z.object({
  VITE_API_BASE_URL: z.string().min(1).default('/api'),
  VITE_ENABLE_MOCKS: z.stringbool().default(false),
  /** Third-party product search endpoint; absolute so it bypasses `VITE_API_BASE_URL`. */
  VITE_SEARCH_API_URL: z.url().default('https://dummyjson.com/products/search'),
  /** Third-party users list endpoint; absolute so it bypasses `VITE_API_BASE_URL`. */
  VITE_USERS_API_URL: z.url().default('https://dummyjson.com/users'),
});

export type Env = z.infer<typeof envSchema>;

export function parseEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return result.data;
}

export const env: Env = parseEnv(import.meta.env);
