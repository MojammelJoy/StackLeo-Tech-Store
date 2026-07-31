import { vi } from "vitest";

import { createMockPrismaClient } from "./prisma.mock";
import { createMockRedisClient } from "./redis.mock";

import type { PrismaClient } from "@prisma/client";
import type Redis from "ioredis";
import type { Mock } from "vitest";

/** Mirrors `database/index.ts`'s real export surface — a test that
 * needs to replace the whole `database/` module (e.g. via
 * `vi.mock("../../../database", () => createMockDatabaseModule())`)
 * gets a drop-in shape without ever touching the real, eagerly-constructed
 * `prisma`/`redis` singletons. */
export interface MockDatabaseModule {
  prisma: PrismaClient;
  redis: Redis;
  connectDatabase: Mock;
  disconnectDatabase: Mock;
  checkDatabaseConnection: Mock;
  connectRedis: Mock;
  disconnectRedis: Mock;
  checkRedisConnection: Mock;
}

export function createMockDatabaseModule(): MockDatabaseModule {
  return {
    prisma: createMockPrismaClient(),
    redis: createMockRedisClient(),
    connectDatabase: vi.fn().mockResolvedValue(undefined),
    disconnectDatabase: vi.fn().mockResolvedValue(undefined),
    checkDatabaseConnection: vi.fn().mockResolvedValue(true),
    connectRedis: vi.fn().mockResolvedValue(undefined),
    disconnectRedis: vi.fn().mockResolvedValue(undefined),
    checkRedisConnection: vi.fn().mockResolvedValue(true),
  };
}
