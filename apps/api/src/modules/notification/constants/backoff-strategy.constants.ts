/** How the delay between retry attempts grows — see
 * `types/retry-policy.types.ts` and
 * `utils/retry-policy.util.ts`'s `calculateNextRetryDelayMs`. */
export const BACKOFF_STRATEGIES = {
  FIXED: "fixed",
  EXPONENTIAL: "exponential",
} as const;

export type BackoffStrategy = (typeof BACKOFF_STRATEGIES)[keyof typeof BACKOFF_STRATEGIES];
