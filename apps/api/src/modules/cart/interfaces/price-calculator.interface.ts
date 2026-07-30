import type { CartItem, CartSummary } from "../types";

/** What every price calculator operates on: the items being priced (typically the selected ones) and the cart's currency. */
export interface CartPricingContext {
  items: CartItem[];
  currency: string;
}

/**
 * Three separate, pluggable calculators rather than one monolithic
 * "apply all adjustments" function — a future discount module can
 * implement `DiscountCalculator` without knowing anything about tax or
 * shipping, and vice versa. `utils/price-calculator.util.ts`'s
 * `defaultPriceCalculator` implements all three as placeholders
 * (always `0`) until those modules exist.
 */
export interface DiscountCalculator {
  calculateDiscount(context: CartPricingContext, subtotal: number): number;
}

export interface TaxCalculator {
  calculateTax(context: CartPricingContext, subtotal: number): number;
}

export interface ShippingCalculator {
  calculateShipping(context: CartPricingContext, subtotal: number): number;
}

/** Composes the three calculators above into the full `CartSummary`. */
export interface PriceCalculator {
  calculateSummary(context: CartPricingContext): CartSummary;
}
