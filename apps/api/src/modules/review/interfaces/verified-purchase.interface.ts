/**
 * What a review's "verified purchase" badge is backed by — `orderId`/
 * `orderItemId` are bare FK-shaped strings; this module never imports
 * `modules/order`. `null` on `Review.verifiedPurchase` (see
 * `types/review.types.ts`) means the reviewer's purchase was never
 * confirmed, not that the check failed — no code in this foundation
 * actually performs that confirmation.
 */
export interface VerifiedPurchaseReference {
  orderId: string;
  orderItemId: string;
  verifiedAt: Date;
}
