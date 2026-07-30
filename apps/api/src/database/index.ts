/**
 * Database layer entrypoint. Aggregates the Prisma (PostgreSQL) and Redis
 * clients behind a single import so the rest of the application never
 * reaches into `database/prisma` or `database/redis` directly.
 */
export * from "./prisma";
export * from "./redis";
