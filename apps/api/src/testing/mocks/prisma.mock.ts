import { vi } from "vitest";

import type { PrismaClient } from "@prisma/client";

/**
 * A fake `PrismaClient` — only the base client methods (`$connect`,
 * `$disconnect`, `$transaction`, `$queryRaw`, `$executeRaw`) are
 * mocked, since `prisma/schema.prisma` has no models yet and therefore
 * no generated model delegates to fake. Deliberately imports only the
 * *type* `PrismaClient` from `@prisma/client`, never `database/`'s
 * `prisma` singleton — that singleton calls `new PrismaClient()` at
 * import time (a known pre-existing issue; see `database/prisma/client.ts`),
 * so importing it here would make importing this mock crash exactly
 * the tests it's meant to keep safe.
 */
export function createMockPrismaClient(): PrismaClient {
  return {
    $connect: vi.fn().mockResolvedValue(undefined),
    $disconnect: vi.fn().mockResolvedValue(undefined),
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
    $executeRaw: vi.fn(),
  } as unknown as PrismaClient;
}
