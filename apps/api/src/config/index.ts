import { env } from "./env";

/**
 * Typed, structured application configuration derived from validated
 * environment variables. The rest of the application depends on this
 * shape and never reads `process.env` directly.
 */
export const config = {
  env: env.NODE_ENV,
  isProduction: env.NODE_ENV === "production",
  isDevelopment: env.NODE_ENV === "development",
  isTest: env.NODE_ENV === "test",

  server: {
    port: env.PORT,
  },

  cors: {
    allowedOrigins: env.CORS_ALLOWED_ORIGINS,
  },

  database: {
    url: env.DATABASE_URL,
  },

  redis: {
    url: env.REDIS_URL,
  },

  logger: {
    level: env.LOG_LEVEL,
  },
} as const;

export type Config = typeof config;
