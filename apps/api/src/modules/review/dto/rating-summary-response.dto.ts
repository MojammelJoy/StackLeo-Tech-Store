import type { ReviewSummary } from "../types";

/** The "Rating DTO" deliverable — a product-level aggregate (average +
 * per-star breakdown), distinct from a single review's own DTO. Reuses
 * `ReviewSummary` verbatim, the same way `modules/order`'s
 * `OrderSummaryDto` reuses `OrderSummary`: the domain type already *is*
 * the public shape here, with nothing internal to hide. */
export type RatingSummaryResponseDto = ReviewSummary;
