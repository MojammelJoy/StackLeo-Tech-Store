/**
 * One category's performance over a date range. There is no direct
 * `OrderItem` → `Category` relation in the schema (`OrderItem` only
 * snapshots `productId`; `Product.categoryId` is itself a bare
 * FK-shaped field, not a Prisma relation) — this is computed via a raw
 * `order_items JOIN products` query keyed on the current
 * `Product.categoryId`, so it reflects a product's *current* category
 * assignment, not whatever it was at order time (the schema keeps no
 * historical record of that). `categoryName` is `null` if the category
 * has since been deleted.
 */
export interface CategoryPerformance {
  categoryId: string;
  categoryName: string | null;
  unitsSold: number;
  orderCount: number;
  revenue: number;
}
