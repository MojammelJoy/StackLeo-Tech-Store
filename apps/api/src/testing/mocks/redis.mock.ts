import { vi } from "vitest";

import type Redis from "ioredis";

/**
 * A fake ioredis client covering the handful of methods this app
 * actually calls (`get`/`set`/`del`/`expire`/`ping`/`quit`). Imports
 * only the *type* `Redis` from `ioredis`, never constructs a real one
 * and never imports `database/`'s `redis` singleton, so no network
 * connection is ever attempted.
 */
export function createMockRedisClient(): Redis {
  return {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    expire: vi.fn(),
    ping: vi.fn().mockResolvedValue("PONG"),
    quit: vi.fn().mockResolvedValue("OK"),
    status: "ready",
  } as unknown as Redis;
}
