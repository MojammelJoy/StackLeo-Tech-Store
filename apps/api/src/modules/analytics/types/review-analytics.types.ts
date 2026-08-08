/** An exhaustive 1–5 star breakdown — every rating value present, even
 * at `0`, mirroring `modules/review`'s own `RatingBreakdown` shape
 * without importing it (this module never imports `modules/review`,
 * the same cross-module decoupling every foundation in this app
 * follows — see `repository/analytics.repository.prisma.ts`'s doc
 * comment). */
export interface RatingBreakdown {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
}

/** `totalReviews`/status counts and `averageRating`/`ratingDistribution`
 * are all scoped to `Review.createdAt` within the range — "reviews
 * over time" reads the same range-scoped counts grouped by period
 * instead (see `types/sales-metric.types.ts`-style per-period series,
 * exposed via `getReviewSeries`). */
export interface ReviewAnalyticsSummary {
  totalReviews: number;
  approvedReviews: number;
  pendingReviews: number;
  rejectedReviews: number;
  flaggedReviews: number;
  averageRating: number | null;
  ratingDistribution: RatingBreakdown;
}

/** One product's review volume within a date range — "products with
 * highest review volume". `productId` is a bare FK-shaped string; see
 * `types/product-analytics.types.ts`'s doc comment for why no product
 * name is attached here (unlike `ProductPerformance`, review rows carry
 * no product-name snapshot to read one from). */
export interface ProductReviewVolume {
  productId: string;
  reviewCount: number;
  averageRating: number;
}
