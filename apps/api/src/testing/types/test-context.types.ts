import type { PrismaClient } from "@prisma/client";
import type Redis from "ioredis";

/** What an integration-style test would receive if it needed mocked
 * infrastructure clients together — built from `mocks/database.mock.ts`
 * and `mocks/redis.mock.ts`, never a real connection. */
export interface TestContext {
  prisma: PrismaClient;
  redis: Redis;
}

/**
 * What a future E2E test runner would need — a real base URL to send
 * requests to and an optional bearer token for authenticated requests.
 * No HTTP client, server bootstrap, or E2E runner exists in this
 * foundation; this only documents the shape one would eventually build
 * against, the same way `modules/review`'s `ReviewReply` documents a
 * future capability without implementing it.
 */
export interface E2ETestContext {
  baseUrl: string;
  authToken?: string;
}
