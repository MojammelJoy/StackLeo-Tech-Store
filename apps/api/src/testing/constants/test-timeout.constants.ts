/** Reusable timeout budgets (ms) for async test helpers — e.g.
 * `utils/async.util.ts`'s `waitFor` — so individual tests don't each
 * invent their own magic numbers. */
export const TEST_TIMEOUTS = {
  SHORT: 100,
  DEFAULT: 1000,
  LONG: 5000,
} as const;
