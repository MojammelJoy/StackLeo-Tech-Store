import type { TimeGranularity } from "../constants";

/**
 * One time-bucketed, store-wide inventory-movement data point — the
 * generic `/metrics?metricType=inventory` series. Per-item breakdown
 * (this foundation's original shape modeled a `productId`/`sku` per
 * point) belongs to the bounded `getMostAdjustedInventoryItems` ranking
 * instead (see `types/inventory-analytics.types.ts`). `turnoverRate`
 * from the original shape is dropped — a real turnover figure needs a
 * cost-of-goods-sold basis this schema doesn't track, and it isn't one
 * of this API's requested inventory metrics.
 */
export interface InventoryMetric {
  period: Date;
  granularity: TimeGranularity;
  stockAdditions: number;
  stockDeductions: number;
}
