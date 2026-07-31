import type { RatingSummaryResponseDto, ReviewResponseDto } from "../dto";
import type { Review, ReviewSummary } from "../types";

/** Contract `mapper/review.mapper.ts` implements. Kept separate from
 * `mapper/` itself (mirroring `repository/`'s interface-vs-implementation
 * split) so a future alternate mapper — or a test double — can satisfy
 * the same shape without depending on the concrete implementation. */
export interface ReviewMapper {
  toResponseDto(review: Review): ReviewResponseDto;
  toResponseList(reviews: Review[]): ReviewResponseDto[];
  toSummaryDto(summary: ReviewSummary): RatingSummaryResponseDto;
}
