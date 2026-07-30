import { redis } from "./client";

/**
 * Verifies the Redis connection responds to a real round trip, not just
 * that the client object exists. Used by the readiness endpoint; must
 * never throw.
 */
export async function checkRedisConnection(): Promise<boolean> {
  try {
    const response = await redis.ping();
    return response === "PONG";
  } catch {
    return false;
  }
}
