/**
 * A fully valid, fake environment satisfying `config/env.schema.ts`'s
 * `envSchema` — every value here is shaped to pass that schema's
 * validation (e.g. both JWT secrets are 32+ characters) without ever
 * pointing at a real database, cache, or secret. `vitest.config.ts`
 * injects these into every test worker's `process.env` via `test.env`
 * so importing `config/` (directly or transitively, e.g. through
 * `auth/`) never throws in a test run. See
 * `config/test-env.config.ts`'s `applyTestEnvDefaults` for the runtime
 * equivalent.
 */
export const TEST_ENV_DEFAULTS = {
  NODE_ENV: "test",
  PORT: "4100",
  DATABASE_URL: "postgresql://test:test@localhost:5432/stackleo_test",
  REDIS_URL: "redis://localhost:6379/1",
  JWT_ACCESS_SECRET: "test-access-secret-do-not-use-in-production-00000",
  JWT_REFRESH_SECRET: "test-refresh-secret-do-not-use-in-production-0000",
  JWT_ACCESS_EXPIRES_IN: "15m",
  JWT_REFRESH_EXPIRES_IN: "7d",
  CORS_ALLOWED_ORIGINS: "http://localhost:3000",
  LOG_LEVEL: "silent",
} as const;
