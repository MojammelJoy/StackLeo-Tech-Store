import type { PaymentProviderName } from "../constants";

/**
 * What a future webhook endpoint would parse an incoming gateway
 * notification into before handing it to the service. No handler exists
 * yet — wiring an actual endpoint that receives and verifies gateway
 * webhooks is out of scope for this foundation; this interface only
 * documents the shape such an endpoint would eventually produce.
 */
export interface PaymentWebhookEvent {
  provider: PaymentProviderName;
  eventType: string;
  payload: unknown;
  receivedAt: Date;
}
