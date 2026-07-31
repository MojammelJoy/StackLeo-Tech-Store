import { MODERATION_STATUSES } from "../constants";

import type { Review } from "../types";

/** Whether `review` is currently visible to shoppers. */
export function isVisible(review: Review): boolean {
  return review.moderationStatus === MODERATION_STATUSES.APPROVED;
}

export function isPending(review: Review): boolean {
  return review.moderationStatus === MODERATION_STATUSES.PENDING;
}

export function isFlagged(review: Review): boolean {
  return review.moderationStatus === MODERATION_STATUSES.FLAGGED;
}
