/**
 * A cart's computed price summary — always derived from its (selected)
 * items, never stored, so it can never drift out of sync with them. See
 * `utils/price-calculator.util.ts`'s `calculateCartSummary`.
 *
 * `discountTotal`/`taxTotal`/`shippingTotal` are placeholders: this
 * foundation always resolves them to `0` (see `defaultPriceCalculator`
 * in `utils/price-calculator.util.ts`) because no discount, tax, or
 * shipping module exists yet. The fields exist so those future modules
 * have somewhere to plug in a real calculation without this shape
 * changing.
 */
export interface CartSummary {
  /** Total quantity across selected items. */
  itemCount: number;
  /** Sum of `unitPrice * quantity` across selected items. */
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  /** `subtotal - discountTotal + taxTotal + shippingTotal`. */
  total: number;
  currency: string;
}
