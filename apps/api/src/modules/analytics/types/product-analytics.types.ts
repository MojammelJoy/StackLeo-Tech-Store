/**
 * One product's performance over a date range. `productId`/`sku`/
 * `productName` are read from `OrderItem`'s own checkout-time snapshot
 * (see `prisma/schema.prisma`'s `OrderItem` doc comment) — never from
 * `modules/product`, which this module never imports. `revenue` is
 * `SUM(quantity * unitPrice)` across every matching `OrderItem`, computed
 * in the database (see `repository/analytics.repository.prisma.ts`'s
 * `getTopProducts` doc comment for why this needs a raw query).
 * `reviewCount`/`averageRating` come from `modules/review`'s own
 * `ReviewRatingSummary` cache — never recomputed here.
 */
export interface ProductPerformance {
  productId: string;
  sku: string;
  productName: string;
  unitsSold: number;
  orderCount: number;
  revenue: number;
  averageSellingPrice: number;
  reviewCount: number;
  averageRating: number | null;
}

/** A current catalog snapshot — "total products"/"active products" for
 * the dashboard overview, not scoped to any date range. */
export interface ProductCatalogSnapshot {
  totalProducts: number;
  activeProducts: number;
}
