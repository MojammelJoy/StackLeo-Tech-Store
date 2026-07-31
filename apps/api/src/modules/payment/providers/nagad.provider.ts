import { NotImplementedError } from "../../../errors";
import { PAYMENT_PROVIDERS } from "../constants";

import type { RefundRequest } from "../interfaces";
import type { PaymentTransaction } from "../types";
import type { ChargeRequest, PaymentProvider } from "./payment-provider.interface";

/** Configuration a real Nagad integration would need. */
export interface NagadProviderConfig {
  merchantId: string;
  merchantPrivateKey: string;
  nagadPublicKey: string;
  sandbox: boolean;
}

/**
 * `PaymentProvider` implementation for Nagad — currently a skeleton.
 * Every method throws `NotImplementedError` rather than calling the
 * Nagad API (no Nagad SDK/package is installed or imported here); wiring
 * in the real integration is out of scope for this foundation.
 */
export class NagadProvider implements PaymentProvider {
  readonly name = PAYMENT_PROVIDERS.NAGAD;

  constructor(private readonly config: NagadProviderConfig) {}

  async charge(request: ChargeRequest): Promise<PaymentTransaction> {
    throw new NotImplementedError(
      `NagadProvider.charge is not implemented yet (paymentId: ${request.paymentId})`,
    );
  }

  async verify(providerRef: string): Promise<PaymentTransaction> {
    throw new NotImplementedError(
      `NagadProvider.verify is not implemented yet (providerRef: ${providerRef})`,
    );
  }

  async refund(request: RefundRequest): Promise<PaymentTransaction> {
    throw new NotImplementedError(
      `NagadProvider.refund is not implemented yet (transactionId: ${request.transactionId})`,
    );
  }
}
