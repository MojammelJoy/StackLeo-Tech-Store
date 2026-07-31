import { config } from "../../../config";
import {
  BACKOFF_STRATEGIES,
  NOTIFICATION_DEFAULT_MAX_RETRIES_DEV,
  NOTIFICATION_DEFAULT_MAX_RETRIES_PRODUCTION,
} from "../constants";

import type { RetryPolicy } from "../types";

/**
 * How many times a failed notification should be retried before this
 * app gives up on it. In production, transient provider failures (rate
 * limits, brief outages) are worth retrying a few times; outside
 * production, retrying just delays feedback during development and
 * automated test runs, so the default is 0. Mirrors
 * `modules/coupon`'s "stricter behavior in production" pattern, applied
 * to a numeric default (like `modules/cart`'s guest-expiry split)
 * rather than a validation rule.
 */
export function getDefaultMaxRetries(): number {
  return config.isProduction
    ? NOTIFICATION_DEFAULT_MAX_RETRIES_PRODUCTION
    : NOTIFICATION_DEFAULT_MAX_RETRIES_DEV;
}

/** Pure delay-math over a `RetryPolicy` — no scheduling, no actual
 * queue. `attempt` is zero-based (the first retry is `attempt === 0`). */
export function calculateNextRetryDelayMs(attempt: number, policy: RetryPolicy): number {
  if (policy.backoffStrategy === BACKOFF_STRATEGIES.EXPONENTIAL) {
    return policy.initialDelayMs * 2 ** attempt;
  }
  return policy.initialDelayMs;
}
