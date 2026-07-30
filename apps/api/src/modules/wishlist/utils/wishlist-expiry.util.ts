import { config } from "../../../config";

const GUEST_WISHLIST_EXPIRY_DAYS_PRODUCTION = 90;
const GUEST_WISHLIST_EXPIRY_DAYS_NON_PRODUCTION = 1;

/**
 * How long a guest wishlist (identified by `guestToken`, never a real
 * user account) should be considered valid before it's treated as
 * abandoned. Longer than `modules/cart`'s equivalent
 * (`getGuestCartExpiryDays`) — a wishlist is a longer-term "save for
 * later" concept than an active cart, so a real shopper is more likely
 * to return to it weeks later. Shorter outside production so
 * manually-created test wishlists don't linger. Mirrors the same
 * prod-vs-dev split `modules/cart` and every other module with a
 * `config/` integration already use elsewhere in this app. Returns a
 * value only; nothing in this foundation actually expires a wishlist
 * with it.
 */
export function getGuestWishlistExpiryDays(): number {
  return config.isProduction
    ? GUEST_WISHLIST_EXPIRY_DAYS_PRODUCTION
    : GUEST_WISHLIST_EXPIRY_DAYS_NON_PRODUCTION;
}
