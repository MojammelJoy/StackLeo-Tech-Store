import { NotImplementedError } from "../../../errors";
import { PAYMENT_PROVIDERS } from "../constants";

import type { RefundRequest } from "../interfaces";
import type { PaymentTransaction } from "../types";
import type { ChargeRequest, PaymentProvider } from "./payment-provider.interface";

/** Configuration a real bKash integration would need. */
export interface BkashProviderConfig {
  appKey: string;
  appSecret: string;
  username: string;
  password: string;
  sandbox: boolean;
}

/**
 * `PaymentProvider` implementation for bKash — currently a skeleton.
 * Every method throws `NotImplementedError` rather than calling the
 * bKash API (no bKash SDK/package is installed or imported here); wiring
 * in the real integration is out of scope for this foundation.
 */
export class BkashProvider implements PaymentProvider {
  readonly name = PAYMENT_PROVIDERS.BKASH;

  constructor(private readonly config: BkashProviderConfig) {}

  async charge(request: ChargeRequest): Promise<PaymentTransaction> {
    throw new NotImplementedError(
      `BkashProvider.charge is not implemented yet (paymentId: ${request.paymentId})`,
    );
  }

  async verify(providerRef: string): Promise<PaymentTransaction> {
    throw new NotImplementedError(
      `BkashProvider.verify is not implemented yet (providerRef: ${providerRef})`,
    );
  }

  async refund(request: RefundRequest): Promise<PaymentTransaction> {
    throw new NotImplementedError(
      `BkashProvider.refund is not implemented yet (transactionId: ${request.transactionId})`,
    );
  }
}
