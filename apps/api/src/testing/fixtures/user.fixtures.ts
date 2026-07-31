import { createTestUser } from "../factories";

/**
 * A small, deterministic set of pre-built users — for tests that want a
 * fixed dataset to assert against (e.g. "there are 2 users, one
 * inactive") rather than building their own via `factories/user.factory.ts`
 * every time. Built once at module load, not per-test, so repeated
 * reads within one file see the same objects.
 */
export const SAMPLE_USERS = [
  createTestUser({ email: "active.customer@example.test" }),
  createTestUser({ email: "inactive.customer@example.test", isActive: false }),
];
