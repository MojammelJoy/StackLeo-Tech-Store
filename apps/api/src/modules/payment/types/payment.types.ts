import type { CurrencyCode, PaymentMethod, PaymentProviderName, PaymentStatus } from "../constants";

/**
 * `orderId` is a bare FK-shaped string, never a relation — this module
 * never imports `modules/order` (or vice versa; see that module's own
 * `interfaces/payment-reference.interface.ts`, which documents the same
 * boundary from the other side). `userId` is nullable for guest-checkout
 * orders, mirroring `modules/order`'s own optional user identity.
 */
export interface Payment {
  id: string;
  orderId: string;
  userId: string | null;
  method: PaymentMethod;
  provider: PaymentProviderName;
  status: PaymentStatus;
  amount: number;
  currency: CurrencyCode;
  providerRef: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentInput {
  orderId: string;
  userId?: string | null;
  method: PaymentMethod;
  provider: PaymentProviderName;
  amount: number;
  currency: CurrencyCode;
  status?: PaymentStatus;
  providerRef?: string | null;
}

/** Deliberately narrow — a payment's identity (`orderId`, `method`,
 * `amount`, `currency`) never changes after creation; only its lifecycle
 * status and the gateway's own reference can be updated. */
export interface UpdatePaymentInput {
  status?: PaymentStatus;
  providerRef?: string | null;
}
