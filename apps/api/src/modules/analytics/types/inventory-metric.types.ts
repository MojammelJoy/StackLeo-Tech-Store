import type { TimeGranularity } from "../constants";

/** `productId`/`sku` are bare FK-shaped strings; this module never
 * imports `modules/inventory`. */
export interface InventoryMetric {
  productId: string;
  sku: string;
  period: Date;
  granularity: TimeGranularity;
  stockOnHand: number;
  turnoverRate: number;
}
