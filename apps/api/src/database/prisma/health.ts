import { prisma } from "./client";

/**
 * Verifies the Prisma connection actually round-trips to PostgreSQL, not
 * just that the client object has been instantiated. Used by the
 * readiness endpoint; must never throw.
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
