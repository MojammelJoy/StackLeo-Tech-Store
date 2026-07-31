/** How the customer chooses to pay, at a conceptual level. See
 * `payment-provider.constants.ts` for which concrete gateway actually
 * processes a given method. */
export const PAYMENT_METHODS = {
  CARD: "card",
  MOBILE_BANKING: "mobile_banking",
  BANK_TRANSFER: "bank_transfer",
  CASH_ON_DELIVERY: "cash_on_delivery",
} as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];
