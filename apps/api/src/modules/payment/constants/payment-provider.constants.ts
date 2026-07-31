import { PAYMENT_METHODS } from "./payment-method.constants";

import type { PaymentMethod } from "./payment-method.constants";

/**
 * The concrete gateway that processes a payment. `MANUAL` covers cash on
 * delivery and any other offline settlement — there is no external
 * system to call, so it's modeled as a provider like any other rather
 * than as a special case threaded through the service.
 */
export const PAYMENT_PROVIDERS = {
  STRIPE: "stripe",
  SSLCOMMERZ: "sslcommerz",
  BKASH: "bkash",
  NAGAD: "nagad",
  MANUAL: "manual",
} as const;

export type PaymentProviderName = (typeof PAYMENT_PROVIDERS)[keyof typeof PAYMENT_PROVIDERS];

/**
 * Which providers are valid for a given payment method. Single source of
 * truth for `validation/create-payment.schema.ts`'s method/provider
 * cross-field check, so the two never drift apart.
 */
export const PAYMENT_METHOD_PROVIDERS: Record<PaymentMethod, readonly PaymentProviderName[]> = {
  [PAYMENT_METHODS.CARD]: [PAYMENT_PROVIDERS.STRIPE, PAYMENT_PROVIDERS.SSLCOMMERZ],
  [PAYMENT_METHODS.MOBILE_BANKING]: [
    PAYMENT_PROVIDERS.BKASH,
    PAYMENT_PROVIDERS.NAGAD,
    PAYMENT_PROVIDERS.SSLCOMMERZ,
  ],
  [PAYMENT_METHODS.BANK_TRANSFER]: [PAYMENT_PROVIDERS.SSLCOMMERZ],
  [PAYMENT_METHODS.CASH_ON_DELIVERY]: [PAYMENT_PROVIDERS.MANUAL],
};
