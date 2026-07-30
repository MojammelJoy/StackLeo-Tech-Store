export const CART_ITEM_MIN_QUANTITY = 1;
export const CART_ITEM_MAX_QUANTITY = 99;
export const CART_CURRENCY_CODE_LENGTH = 3;
export const CART_DEFAULT_CURRENCY = "USD";

/**
 * A cart's lifecycle. `MERGED` is what a guest cart becomes once its
 * items have been folded into the same user's authenticated cart after
 * login (see `service/cart.service.ts`'s `mergeGuestCartIntoUserCart`);
 * `CONVERTED` is what an authenticated cart becomes once checkout
 * produces an order — a future concern (no checkout/order module exists
 * yet), noted here only so this status has somewhere to point to.
 */
export const CART_STATUSES = {
  ACTIVE: "active",
  MERGED: "merged",
  ABANDONED: "abandoned",
  CONVERTED: "converted",
} as const;

export type CartStatus = (typeof CART_STATUSES)[keyof typeof CART_STATUSES];

export const CART_SORTABLE_FIELDS = ["createdAt", "updatedAt"] as const;
export const CART_FILTERABLE_FIELDS = ["userId", "status"] as const;
