import type { TimeGranularity } from "../constants";

/**
 * One time-bucketed, store-wide product-sales data point — the generic
 * `/metrics?metricType=product` series. Per-product breakdown (which
 * this foundation's original shape modeled via a `productId` field on
 * every point — an unbounded one-row-per-product-per-period dataset)
 * belongs to the bounded, paginated `getTopProducts` ranking instead
 * (see `types/product-analytics.types.ts`'s `ProductPerformance`).
 * `viewCount` from the original shape is dropped entirely — no
 * product-view tracking exists anywhere in this schema (`modules/product`/
 * `modules/search` record no such event), and "do not invent it" applies.
 */
export interface ProductMetric {
  period: Date;
  granularity: TimeGranularity;
  unitsSold: number;
  revenue: number;
}
