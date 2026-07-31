/**
 * Runs once after the entire test run finishes. Currently a no-op —
 * every mock in `mocks/` (`prisma.mock.ts`, `redis.mock.ts`) never
 * opens a real connection, so there is nothing to close yet. Kept as
 * its own named, independently callable function — rather than inlined
 * into `global-setup.ts`'s returned teardown closure — so a future real
 * integration harness (a test database container, a real Redis
 * instance) has one obvious place to add real cleanup without touching
 * `global-setup.ts` itself.
 */
export function runGlobalTeardown(): void {
  // Intentionally empty — see the comment above.
}
