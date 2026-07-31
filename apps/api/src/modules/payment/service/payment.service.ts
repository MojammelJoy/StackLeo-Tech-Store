import { NotImplementedError } from "../../../errors";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { PaymentProviderName } from "../constants";
import type { CreatePaymentDto, RefundPaymentDto, VerifyPaymentDto } from "../dto";
import type { PaymentFilterOptions } from "../interfaces";
import type { PaymentProvider } from "../providers";
import type { PaymentRepository } from "../repository";
import type { Payment, PaymentTransaction } from "../types";

/**
 * Skeleton payment service — the operations a concrete implementation
 * will expose once payment persistence and real gateway integrations
 * exist. Depends on `PaymentRepository` (interface only; see
 * `repository/`) for persistence and a *registry* of `PaymentProvider`s
 * keyed by name — never a single hardcoded provider — which is what
 * actually lets this foundation "support multiple payment providers":
 * routing a charge to Stripe, SSLCommerz, bKash, or Nagad is a matter of
 * choosing a registry key (or none at all, for cash on delivery — see
 * `PAYMENT_PROVIDERS.MANUAL`), not branching logic baked into this
 * class. Every method throws `NotImplementedError` — no database
 * operations, no calls to any provider, and no business rules (how to
 * pick a provider, when a refund is allowed, etc.) happen in this
 * foundation.
 *
 * `initiate` accepts an optional `actor` since guest checkout never
 * authenticates (mirroring `modules/order`'s guest/user split); `refund`
 * requires one — issuing a refund is always an attributable action.
 * Nothing here checks `actor`'s permissions; that is `modules/rbac`'s
 * job, applied by whatever middleware sits in front of this service once
 * it exists.
 */
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentProviders: Partial<Record<PaymentProviderName, PaymentProvider>>,
  ) {}

  async findById(id: string): Promise<Payment | null> {
    throw new NotImplementedError(`PaymentService.findById is not implemented yet (id: ${id})`);
  }

  async findByOrderId(orderId: string): Promise<Payment[]> {
    throw new NotImplementedError(
      `PaymentService.findByOrderId is not implemented yet (orderId: ${orderId})`,
    );
  }

  async findAll(
    _query: ParsedQuery,
    _filters?: PaymentFilterOptions,
  ): Promise<PaginatedResult<Payment>> {
    throw new NotImplementedError("PaymentService.findAll is not implemented yet");
  }

  async initiate(_dto: CreatePaymentDto, _actor?: AuthenticatedUser): Promise<Payment> {
    throw new NotImplementedError("PaymentService.initiate is not implemented yet");
  }

  async verify(id: string, _dto: VerifyPaymentDto): Promise<Payment> {
    throw new NotImplementedError(`PaymentService.verify is not implemented yet (id: ${id})`);
  }

  async refund(
    id: string,
    _dto: RefundPaymentDto,
    _actor: AuthenticatedUser,
  ): Promise<PaymentTransaction> {
    throw new NotImplementedError(`PaymentService.refund is not implemented yet (id: ${id})`);
  }

  async getTransactions(paymentId: string): Promise<PaymentTransaction[]> {
    throw new NotImplementedError(
      `PaymentService.getTransactions is not implemented yet (paymentId: ${paymentId})`,
    );
  }

  async markCashOnDeliveryCollected(id: string, _actor: AuthenticatedUser): Promise<Payment> {
    throw new NotImplementedError(
      `PaymentService.markCashOnDeliveryCollected is not implemented yet (id: ${id})`,
    );
  }
}
