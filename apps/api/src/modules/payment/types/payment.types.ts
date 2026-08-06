import type { CurrencyCode, PaymentMethod, PaymentProviderName, PaymentStatus } from "../constants";

/**
 * `orderId` is a bare FK-shaped string, never a relation — this module
 * never imports `modules/order` (or vice versa; see that module's own
 * `interfaces/payment-reference.interface.ts`, which documents the same
 * boundary from the other side). `userId` is nullable for guest-checkout
 * orders, mirroring `modules/order`'s own optional user identity.
 *
 * `transactionId` is this payment's own customer-facing identifier
 * (e.g. `"PAY-00001234"`), derived from `sequenceNumber` at read time —
 * see `prisma/schema.prisma`'s `Payment` doc comment and
 * `utils/payment-reference.util.ts`'s `formatPaymentReference`. Never
 * confuse it with `providerRef`, the *gateway's* own reference: the
 * former always exists from the moment a payment is created (even for
 * `PAYMENT_PROVIDERS.MANUAL`, which has no gateway at all); the latter
 * stays `null` until a real provider assigns one.
 */
export interface Payment {
  id: string;
  /** Customer-facing identifier, e.g. `"PAY-00001234"` — derived from
   * `sequenceNumber` at read time, never stored. */
  transactionId: string;
  /** The native Postgres autoincrement counter `transactionId` is
   * formatted from — see `prisma/schema.prisma`'s `Payment` doc comment. */
  sequenceNumber: number;
  orderId: string;
  userId: string | null;
  method: PaymentMethod;
  provider: PaymentProviderName;
  status: PaymentStatus;
  amount: number;
  currency: CurrencyCode;
  providerRef: string | null;
  /** Free-form gateway/context data — "store payment metadata". Never
   * interpreted by this module; a future provider integration decides
   * what it puts here. */
  metadata: Record<string, unknown> | null;
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
  metadata?: Record<string, unknown> | null;
}

/** Deliberately narrow — a payment's identity (`orderId`, `method`,
 * `amount`, `currency`) never changes after creation; only its lifecycle
 * status and the gateway's own reference can be updated. */
export interface UpdatePaymentInput {
  status?: PaymentStatus;
  providerRef?: string | null;
}
