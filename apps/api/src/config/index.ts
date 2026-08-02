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

  auth: {
    jwt: {
      accessSecret: env.JWT_ACCESS_SECRET,
      refreshSecret: env.JWT_REFRESH_SECRET,
      accessExpiresIn: env.JWT_ACCESS_EXPIRES_IN,
      refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
    },
  },

  logger: {
    level: env.LOG_LEVEL,
  },

  media: {
    localStorageDir: env.MEDIA_LOCAL_STORAGE_DIR,
    localPublicUrlPath: env.MEDIA_LOCAL_PUBLIC_URL_PATH,
  },
} as const;

export type Config = typeof config;
