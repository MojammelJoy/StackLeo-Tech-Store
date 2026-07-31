import type { TimeGranularity } from "../constants";

/** `productId` is a bare FK-shaped string; this module never imports
 * `modules/product`. */
export interface ProductMetric {
  productId: string;
  period: Date;
  granularity: TimeGranularity;
  unitsSold: number;
  revenue: number;
  viewCount: number;
}
