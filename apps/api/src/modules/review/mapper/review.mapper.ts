import { getHelpfulnessRatio } from "../utils";

import type { RatingSummaryResponseDto, ReviewResponseDto } from "../dto";
import type { ReviewMapper } from "../interfaces";
import type { Review, ReviewSummary } from "../types";

function toResponseDto(review: Review): ReviewResponseDto {
  return {
    id: review.id,
    productId: review.productId,
    userId: review.userId,
    rating: review.rating,
    title: review.title,
    body: review.body,
    media: review.media,
    verifiedPurchase: review.verifiedPurchase !== null,
    moderationStatus: review.moderationStatus,
    helpfulCount: review.helpfulCount,
    unhelpfulCount: review.unhelpfulCount,
    helpfulnessRatio: getHelpfulnessRatio(review),
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

function toResponseList(reviews: Review[]): ReviewResponseDto[] {
  return reviews.map(toResponseDto);
}

function toSummaryDto(summary: ReviewSummary): RatingSummaryResponseDto {
  return summary;
}

/** The only place a `Review`/`ReviewSummary` is converted to its public
 * response-DTO shape — callers map through this instead of building the
 * DTO by hand. */
export const reviewMapper: ReviewMapper = { toResponseDto, toResponseList, toSummaryDto };
