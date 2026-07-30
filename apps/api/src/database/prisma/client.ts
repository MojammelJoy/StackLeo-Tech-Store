import { PrismaClient } from "@prisma/client";

import { config } from "../../config";
import { logger } from "../../logger";

/**
 * Factory for a Prisma client. Kept separate from the shared singleton
 * below so tests or one-off scripts can construct an isolated instance
 * instead of reaching into the process-wide connection.
 */
export function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    datasourceUrl: config.database.url,
    log: config.isProduction ? ["error", "warn"] : ["warn", "error"],
  });
}

/**
 * Shared Prisma client instance. No models are defined yet — this exists
 * purely to establish the database connection lifecycle the rest of the
 * application will depend on once domain models are introduced.
 */
export const prisma = createPrismaClient();

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info("Database connection established");
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info("Database connection closed");
}
