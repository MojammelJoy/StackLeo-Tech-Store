/**
 * What a future eligibility check would need to know about the cart/
 * order it's evaluating a coupon against — bare FK-shaped ids, never
 * relations, for the same cross-module decoupling reason `Coupon`'s own
 * `eligible*Ids` fields are bare arrays (see `types/coupon.types.ts`).
 * No function in this foundation actually performs this check (that's
 * discount/eligibility business logic, out of scope here); this only
 * documents the shape such a check would take and return.
 */
export interface EligibilityContext {
  userId?: string;
  orderAmount: number;
  productIds: string[];
  categoryIds: string[];
  brandIds: string[];
}

export interface EligibilityResult {
  eligible: boolean;
  reasons: string[];
}
