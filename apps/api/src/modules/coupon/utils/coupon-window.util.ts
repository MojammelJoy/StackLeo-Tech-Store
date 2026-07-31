import type { Coupon } from "../types";

/** Pure date-window predicates over an already-loaded `Coupon` — no
 * database access, no clock mocking beyond the optional `now` param. */
export function hasStarted(coupon: Coupon, now: Date = new Date()): boolean {
  return coupon.startsAt === null || coupon.startsAt <= now;
}

export function isExpired(coupon: Coupon, now: Date = new Date()): boolean {
  return coupon.expiresAt !== null && coupon.expiresAt <= now;
}

export function isWithinActiveWindow(coupon: Coupon, now: Date = new Date()): boolean {
  return hasStarted(coupon, now) && !isExpired(coupon, now);
}
