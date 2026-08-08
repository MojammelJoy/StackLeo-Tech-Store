import type { TimeGranularity } from "../constants";

/** One time-bucketed count of newly-registered customers —
 * `User.count()` grouped by `createdAt`. `returningCustomers`/
 * `churnRate` from the original shape are dropped: churn prediction is
 * explicitly out of scope for this API, and no "customer became
 * inactive" event exists in this schema to measure either non-
 * speculatively. */
export interface CustomerMetric {
  period: Date;
  granularity: TimeGranularity;
  newCustomers: number;
}
