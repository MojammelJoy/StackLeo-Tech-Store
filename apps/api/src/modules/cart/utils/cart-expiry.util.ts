import { config } from "../../../config";

const GUEST_CART_EXPIRY_DAYS_PRODUCTION = 30;
const GUEST_CART_EXPIRY_DAYS_NON_PRODUCTION = 1;

/**
 * How long a guest cart (identified by `guestToken`, never a real user
 * account) should be considered valid before it's treated as abandoned.
 * Longer in production — a real shopper might return days later —
 * shorter outside it, so manually-created test carts don't linger and
 * accumulate. Mirrors the same prod-vs-dev split `modules/brand`,
 * `modules/inventory`, `modules/media`, and `modules/search` already
 * use elsewhere in this app. Returns a value only; nothing in this
 * foundation actually expires a cart with it.
 */
export function getGuestCartExpiryDays(): number {
  return config.isProduction
    ? GUEST_CART_EXPIRY_DAYS_PRODUCTION
    : GUEST_CART_EXPIRY_DAYS_NON_PRODUCTION;
}
