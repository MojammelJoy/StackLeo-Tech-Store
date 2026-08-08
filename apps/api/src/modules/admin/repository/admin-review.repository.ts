import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { Review, ReviewFilterOptions } from "../../review";

/**
 * The one read `modules/review`'s own `ReviewRepository` doesn't
 * expose: every review across every product, paginated/filtered/
 * sorted/searched — `ReviewRepository.findByProductId` requires a
 * specific product, by design (a shopper browsing one product's
 * reviews). A moderation queue needs the opposite: every review
 * regardless of product. Every other review operation this module needs
 * (`getById`, `moderate`, `delete`, `restore`) already works for a
 * `review:moderate` caller through `modules/review`'s own `ReviewService`
 * — see `service/admin-review.service.ts`, which reuses it directly
 * instead of duplicating any of it here.
 */
export interface AdminReviewRepository {
  findAll(query: ParsedQuery, filters?: ReviewFilterOptions): Promise<PaginatedResult<Review>>;
}
