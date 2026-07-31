import { NotImplementedError } from "../../../errors";
import { PAYMENT_PROVIDERS } from "../constants";

import type { RefundRequest } from "../interfaces";
import type { PaymentTransaction } from "../types";
import type { ChargeRequest, PaymentProvider } from "./payment-provider.interface";

/**
 * Configuration a real Stripe integration would need. Deliberately not
 * sourced from the shared `config/` module — this is a skeleton with no
 * actual Stripe SDK call anywhere in it (out of scope for this
 * foundation), so requiring real credentials to even construct this
 * class would force every environment to configure a service nothing
 * here uses yet.
 */
export interface StripeProviderConfig {
  secretKey: string;
  webhookSecret: string;
}

/**
 * `PaymentProvider` implementation for Stripe — currently a skeleton.
 * Every method throws `NotImplementedError` rather than calling the
 * Stripe API (no `stripe` package is installed or imported here); wiring
 * in the real SDK is out of scope for this foundation.
 */
export class StripeProvider implements PaymentProvider {
  readonly name = PAYMENT_PROVIDERS.STRIPE;

  constructor(private readonly config: StripeProviderConfig) {}

  async charge(request: ChargeRequest): Promise<PaymentTransaction> {
    throw new NotImplementedError(
      `StripeProvider.charge is not implemented yet (paymentId: ${request.paymentId})`,
    );
  }

  async verify(providerRef: string): Promise<PaymentTransaction> {
    throw new NotImplementedError(
      `StripeProvider.verify is not implemented yet (providerRef: ${providerRef})`,
    );
  }

  async refund(request: RefundRequest): Promise<PaymentTransaction> {
    throw new NotImplementedError(
      `StripeProvider.refund is not implemented yet (transactionId: ${request.transactionId})`,
    );
  }
}
