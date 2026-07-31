import type { BackoffStrategy } from "../constants";

/** What a future retry scheduler would apply to a failed notification —
 * see `utils/retry-policy.util.ts`'s `calculateNextRetryDelayMs`, the
 * only function in this foundation that actually consumes one. */
export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: BackoffStrategy;
  initialDelayMs: number;
}
