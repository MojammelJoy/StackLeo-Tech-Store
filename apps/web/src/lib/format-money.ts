/**
 * Formats a minor-unit amount (e.g. cents) as `currency` — every money
 * field this app renders (Cart API amounts, Product API `price`) is a
 * minor-unit integer, never a major-unit decimal, so this is the one
 * place `/ 100` happens. Shared across the cart and product features —
 * promoted out of `components/cart/` once the Product Details Page
 * needed the same formatting for `product.price`/`variant.price`.
 */
export function formatMoney(amountMinorUnits: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amountMinorUnits / 100);
}
