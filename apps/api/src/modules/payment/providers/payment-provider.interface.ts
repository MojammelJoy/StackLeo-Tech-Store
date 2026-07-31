import type { PaymentProviderName } from "../constants";
import type { RefundRequest } from "../interfaces";
import type { Money, PaymentTransaction } from "../types";

export interface ChargeRequest {
  paymentId: string;
  amount: Money;
  /** Where a redirect-based gateway (SSLCommerz/bKash/Nagad/Stripe
   * Checkout) should send the customer back to once they complete —
   * or abandon — the payment on the provider's own site. */
  returnUrl?: string;
}

/**
 * The payment-gateway abstraction every concrete provider (Stripe,
 * SSLCommerz, bKash, Nagad) implements. `service/payment.service.ts`
 * depends on this interface — via a registry keyed by
 * `PaymentProviderName` — never on a concrete provider directly, which
 * is exactly what lets this foundation "support multiple payment
 * providers": adding a fifth gateway later means adding one more class
 * that satisfies this shape, not touching the service. Cash on delivery
 * needs no gateway call at all, so it has no corresponding provider
 * class — see `PAYMENT_PROVIDERS.MANUAL`.
 */
export interface PaymentProvider {
  readonly name: PaymentProviderName;
  charge(request: ChargeRequest): Promise<PaymentTransaction>;
  verify(providerRef: string): Promise<PaymentTransaction>;
  refund(request: RefundRequest): Promise<PaymentTransaction>;
}
