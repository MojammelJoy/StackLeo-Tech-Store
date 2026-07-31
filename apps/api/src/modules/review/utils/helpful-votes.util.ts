import type { Review } from "../types";

/** The fraction of helpful/unhelpful votes that were "helpful" —
 * `null` when a review has no votes yet, so a caller can distinguish
 * "no data" from "0% helpful". */
export function getHelpfulnessRatio(review: Review): number | null {
  const totalVotes = review.helpfulCount + review.unhelpfulCount;
  if (totalVotes === 0) {
    return null;
  }
  return review.helpfulCount / totalVotes;
}
