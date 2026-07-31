export const SUPPORTED_CURRENCIES = ["BDT", "USD", "EUR", "GBP"] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

/**
 * Independent of `modules/payment`'s own copy of this same constant —
 * this module never imports `modules/payment` (or vice versa), the same
 * cross-module decoupling discipline every foundation in this app
 * follows. See `payment/constants/currency.constants.ts` for the sibling
 * definition.
 */
export const DEFAULT_CURRENCY: CurrencyCode = "BDT";
