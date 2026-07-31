import type { TimeGranularity } from "../constants";

/** `currency` is a bare string, not a validated enum — unlike
 * `modules/payment`/`modules/coupon`, this foundation only reports on
 * amounts already recorded elsewhere; it never collects or validates a
 * currency choice itself. */
export interface RevenueMetric {
  period: Date;
  granularity: TimeGranularity;
  grossRevenue: number;
  netRevenue: number;
  discountTotal: number;
  currency: string;
}
