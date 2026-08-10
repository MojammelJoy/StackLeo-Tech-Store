/**
 * Formats a minor-unit amount (e.g. cents) as `currency` — every money
 * field in the Cart API is a minor-unit integer (see
 * `packages/types/src/cart.ts`'s `CartItem`/`CartSummary` doc comments,
 * mirroring apps/api's own "never floating-point" convention), never a
 * major-unit decimal, so this is the one place `/ 100` happens. Shared
 * between `CartItem.tsx` and `CartSummary.tsx` — not promoted to a
 * general `lib/` helper since nothing outside the cart feature needs it
 * yet.
 */
export function formatMoney(amountMinorUnits: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amountMinorUnits / 100);
}
