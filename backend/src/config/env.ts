import { z } from 'zod';

/**
 * Environment variables, validated once at startup.
 * The process fails fast with a readable message if anything is missing or malformed,
 * instead of crashing later on the first request that needs the value.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  /** jsonwebtoken reads a bare number as milliseconds, so a unit is required (e.g. 15m, 1d). */
  JWT_EXPIRES_IN: z
    .string()
    .regex(/^\d+(ms|s|m|h|d|w|y)$/, 'JWT_EXPIRES_IN needs a unit, e.g. 15m, 12h or 1d')
    .default('1d'),
  /** Comma-separated list of origins allowed to call the API. */
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  /** Failed login/register attempts allowed per client per window (decision D24). */
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  AUTH_RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().positive().default(15),
  /**
   * Number of reverse proxies in front of the app (e.g. 1 on Render). Lets Express read
   * the real client IP from X-Forwarded-For; 0 means the app is reached directly.
   */
  TRUST_PROXY: z.coerce.number().int().min(0).default(0),
});

export type Env = z.infer<typeof envSchema>;

/** The value shipped in .env.example; fine locally, never acceptable in production. */
const PLACEHOLDER_JWT_SECRET = 'change-me-to-a-long-random-string';

/** Validates a set of environment variables; exported so the failure path can be tested. */
export function parseEnv(source: NodeJS.ProcessEnv): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${problems}`);
  }
  if (result.data.NODE_ENV === 'production' && result.data.JWT_SECRET === PLACEHOLDER_JWT_SECRET) {
    throw new Error(
      'Invalid environment configuration:\n  - JWT_SECRET is still the placeholder from .env.example; ' +
        'set a long random value (e.g. `openssl rand -hex 32`).',
    );
  }
  return result.data;
}

export const env = parseEnv(process.env);
