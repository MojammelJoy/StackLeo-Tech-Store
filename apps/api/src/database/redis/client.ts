import Redis from "ioredis";

import { config } from "../../config";
import { logger } from "../../logger";

/**
 * Factory for an ioredis client. Connection is lazy — nothing touches the
 * network until `connectRedis` (or an explicit `.connect()` call) runs —
 * so constructing a client is always safe, including in tests.
 */
export function createRedisClient(url: string): Redis {
  const client = new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
  });

  client.on("error", (err) => {
    logger.error({ err }, "Redis client error");
  });

  client.on("connect", () => {
    logger.info("Redis connection established");
  });

  return client;
}

/**
 * Shared Redis client instance used for caching/session storage by the
 * rest of the application.
 */
export const redis = createRedisClient(config.redis.url);

export async function connectRedis(): Promise<void> {
  if (redis.status === "wait") {
    await redis.connect();
  }
}

export async function disconnectRedis(): Promise<void> {
  await redis.quit();
  logger.info("Redis connection closed");
}
