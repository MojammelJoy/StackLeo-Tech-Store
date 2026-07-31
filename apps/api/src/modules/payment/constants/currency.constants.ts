export const SUPPORTED_CURRENCIES = ["BDT", "USD", "EUR", "GBP"] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

/**
 * `bkash`/`nagad`/`sslcommerz` (see `payment-provider.constants.ts`) only
 * ever settle in BDT, so a Bangladesh-focused storefront defaults here
 * rather than to a more "neutral" choice like USD.
 */
export const DEFAULT_CURRENCY: CurrencyCode = "BDT";
