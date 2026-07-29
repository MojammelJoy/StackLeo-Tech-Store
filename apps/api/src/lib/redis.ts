import Redis from "ioredis";

import { config } from "../config";
import { logger } from "../logger";

/**
 * Shared Redis client instance. Connection is established lazily and its
 * lifecycle is managed alongside the HTTP server's graceful shutdown.
 */
export const redis = new Redis(config.redis.url, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

redis.on("error", (err) => {
  logger.error({ err }, "Redis client error");
});

redis.on("connect", () => {
  logger.info("Redis connection established");
});

export async function connectRedis(): Promise<void> {
  if (redis.status === "wait") {
    await redis.connect();
  }
}

export async function disconnectRedis(): Promise<void> {
  await redis.quit();
  logger.info("Redis connection closed");
}

export async function checkRedisConnection(): Promise<boolean> {
  try {
    const response = await redis.ping();
    return response === "PONG";
  } catch {
    return false;
  }
}
