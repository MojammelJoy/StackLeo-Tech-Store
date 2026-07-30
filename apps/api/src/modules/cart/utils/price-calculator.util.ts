import { getSelectedItems } from "./selected-items.util";

import type {
  CartPricingContext,
  DiscountCalculator,
  PriceCalculator,
  ShippingCalculator,
  TaxCalculator,
} from "../interfaces";
import type { CartItem, CartSummary } from "../types";

export function calculateItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((subtotal, item) => subtotal + item.unitPrice * item.quantity, 0);
}

/**
 * Placeholder calculators — each always resolves to `0`, since no
 * discount, tax, or shipping module exists yet. Real implementations
 * satisfy the same `DiscountCalculator`/`TaxCalculator`/
 * `ShippingCalculator` interfaces (see `interfaces/price-calculator.interface.ts`)
 * once those modules exist; nothing else in this foundation needs to
 * change when they do.
 */
export const placeholderDiscountCalculator: DiscountCalculator = {
  calculateDiscount: () => 0,
};

export const placeholderTaxCalculator: TaxCalculator = {
  calculateTax: () => 0,
};

export const placeholderShippingCalculator: ShippingCalculator = {
  calculateShipping: () => 0,
};

/**
 * The default `PriceCalculator` — computes a real subtotal/item count
 * from the given context's items, and `0` for every placeholder. Wire a
 * different `PriceCalculator` into `service/cart.service.ts` once
 * discount/tax/shipping modules exist; this one is what's used until
 * then.
 */
export const defaultPriceCalculator: PriceCalculator = {
  calculateSummary(context: CartPricingContext): CartSummary {
    const subtotal = calculateSubtotal(context.items);
    const discountTotal = placeholderDiscountCalculator.calculateDiscount(context, subtotal);
    const taxTotal = placeholderTaxCalculator.calculateTax(context, subtotal);
    const shippingTotal = placeholderShippingCalculator.calculateShipping(context, subtotal);

    return {
      itemCount: calculateItemCount(context.items),
      subtotal,
      discountTotal,
      taxTotal,
      shippingTotal,
      total: subtotal - discountTotal + taxTotal + shippingTotal,
      currency: context.currency,
    };
  },
};

/**
 * The single entry point `mapper/cart.mapper.ts` uses to build a
 * `CartSummary` — always over selected items only (see
 * `selected-items.util.ts`), via `defaultPriceCalculator`.
 */
export function calculateCartSummary(items: CartItem[], currency: string): CartSummary {
  return defaultPriceCalculator.calculateSummary({ items: getSelectedItems(items), currency });
}
