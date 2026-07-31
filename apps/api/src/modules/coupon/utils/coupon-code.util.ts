/** Coupon codes are case-insensitive from a user's perspective but
 * stored/compared uppercase — this is the one place that normalization
 * happens, so lookups and comparisons never drift. */
export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase();
}
