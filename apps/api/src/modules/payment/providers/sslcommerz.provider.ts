import { NotImplementedError } from "../../../errors";
import { PAYMENT_PROVIDERS } from "../constants";

import type { RefundRequest } from "../interfaces";
import type { PaymentTransaction } from "../types";
import type { ChargeRequest, PaymentProvider } from "./payment-provider.interface";

/** Configuration a real SSLCommerz integration would need. */
export interface SslcommerzProviderConfig {
  storeId: string;
  storePassword: string;
  sandbox: boolean;
}

/**
 * `PaymentProvider` implementation for SSLCommerz — currently a
 * skeleton. Every method throws `NotImplementedError` rather than
 * calling the SSLCommerz API (no SSLCommerz SDK/package is installed or
 * imported here); wiring in the real integration is out of scope for
 * this foundation.
 */
export class SslcommerzProvider implements PaymentProvider {
  readonly name = PAYMENT_PROVIDERS.SSLCOMMERZ;

  constructor(private readonly config: SslcommerzProviderConfig) {}

  async charge(request: ChargeRequest): Promise<PaymentTransaction> {
    throw new NotImplementedError(
      `SslcommerzProvider.charge is not implemented yet (paymentId: ${request.paymentId})`,
    );
  }

  async verify(providerRef: string): Promise<PaymentTransaction> {
    throw new NotImplementedError(
      `SslcommerzProvider.verify is not implemented yet (providerRef: ${providerRef})`,
    );
  }

  async refund(request: RefundRequest): Promise<PaymentTransaction> {
    throw new NotImplementedError(
      `SslcommerzProvider.refund is not implemented yet (transactionId: ${request.transactionId})`,
    );
  }
}
