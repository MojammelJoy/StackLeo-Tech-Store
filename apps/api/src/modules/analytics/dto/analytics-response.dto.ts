import type {
  CouponAnalyticsSummary,
  CouponPerformance,
  CustomerAnalyticsSummary,
  CustomerPerformance,
  InventoryAdjustmentRanking,
  InventoryAnalyticsSummary,
  InventoryMovementSummary,
  OrderAnalyticsSummary,
  OrderStatusBreakdown,
  PaymentAnalyticsSummary,
  ProductCatalogSnapshot,
  ProductPerformance,
  ProductReviewVolume,
  RevenueSummary,
  SalesSummary,
  CategoryPerformance,
  ComparisonResult,
  ReviewAnalyticsSummary,
} from "../types";

/**
 * Public response shapes for every Analytics endpoint — mirrors
 * `modules/review`'s `RatingSummaryResponseDto = ReviewSummary`
 * precedent (a thin re-export of the internal domain type, giving the
 * public contract its own name without duplicating fields). Every
 * ranked endpoint returns `PaginatedResult<...Performance>` directly
 * (already a stable, generic envelope from `common/`), so only the
 * `items` element type needs a response DTO here. Consolidated into one
 * file (rather than one file per DTO, `modules/review`'s literal
 * convention) since every one of these is a same-shape passthrough with
 * nothing module-specific to say per file.
 */
export type SalesSummaryResponseDto = SalesSummary;
export type RevenueSummaryResponseDto = RevenueSummary;
export type OrderSummaryResponseDto = OrderAnalyticsSummary;
export type OrderStatusDistributionResponseDto = OrderStatusBreakdown[];
export type ProductPerformanceResponseDto = ProductPerformance;
export type ProductCatalogSnapshotResponseDto = ProductCatalogSnapshot;
export type CategoryPerformanceResponseDto = CategoryPerformance;
export type CustomerSummaryResponseDto = CustomerAnalyticsSummary;
export type CustomerPerformanceResponseDto = CustomerPerformance;
export type InventorySummaryResponseDto = InventoryAnalyticsSummary;
export type InventoryMovementSummaryResponseDto = InventoryMovementSummary;
export type InventoryAdjustmentRankingResponseDto = InventoryAdjustmentRanking;
export type CouponSummaryResponseDto = CouponAnalyticsSummary;
export type CouponPerformanceResponseDto = CouponPerformance;
export type ReviewSummaryResponseDto = ReviewAnalyticsSummary;
export type ProductReviewVolumeResponseDto = ProductReviewVolume;
export type PaymentSummaryResponseDto = PaymentAnalyticsSummary;
export type ComparisonResponseDto = ComparisonResult;
