import { PrismaClient } from "@prisma/client";

import { config } from "../config";
import { logger } from "../logger";

/**
 * Shared Prisma client instance. No models are defined yet — this file
 * exists purely to establish the database connection lifecycle the rest
 * of the application will depend on once domain models are introduced.
 */
export const prisma = new PrismaClient({
  datasourceUrl: config.database.url,
  log: config.isProduction ? ["error", "warn"] : ["warn", "error"],
});

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info("Database connection established");
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info("Database connection closed");
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
