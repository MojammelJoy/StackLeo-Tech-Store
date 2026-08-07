import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "../../../errors";
import { logger } from "../../../logger";
import {
  PAYMENT_PROVIDERS,
  PAYMENT_STATUSES,
  PAYMENT_TRANSACTION_STATUSES,
  PAYMENT_TRANSACTION_TYPES,
} from "../constants";
import { paymentMapper } from "../mapper";
import { canTransitionPaymentStatus, isCancellable, isSuccessful } from "../utils";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { PaymentProviderName, PaymentStatus } from "../constants";
import type {
  CancelPaymentDto,
  CreatePaymentDto,
  PaymentResponseDto,
  PaymentTransactionResponseDto,
  RetryPaymentDto,
  VerifyPaymentDto,
} from "../dto";
import type {
  OrderLookupProvider,
  OrderPaymentSnapshot,
  PaymentFilterOptions,
} from "../interfaces";
import type { PaymentProvider } from "../providers";
import type { PaymentRepository } from "../repository";
import type { Payment } from "../types";

/** An order in this status can never be paid — decoupled bare string
 * (this module never imports `modules/order`'s `ORDER_STATUSES`, the
 * same discipline `types/payment.types.ts`'s doc comment documents for
 * `orderId` itself). */
const UNPAYABLE_ORDER_STATUS = "cancelled";

/** A payment can only be retried (by creating a fresh `Payment` row —
 * see `PaymentRepository`'s doc comment) once it's actually landed in
 * one of these terminal-for-this-attempt statuses; `PENDING`/
 * `PROCESSING` are still in flight, and `SUCCEEDED`/
 * `PARTIALLY_REFUNDED`/`REFUNDED` need a refund, not a retry. */
const RETRYABLE_STATUSES: readonly PaymentStatus[] = [
  PAYMENT_STATUSES.FAILED,
  PAYMENT_STATUSES.CANCELLED,
];

/**
 * Implements every Payment API operation: creating a payment against an
 * order (attempting a gateway charge, or — for cash on delivery —
 * simply recording the intent), lookup (by id / transaction id /
 * paginated user list / order list), the transaction/status history,
 * verification, retry, cancellation, and marking cash-on-delivery
 * collected. Depends on `PaymentRepository` (payment/transaction
 * persistence), a *registry* of `PaymentProvider`s keyed by
 * `PaymentProviderName` (never a single hardcoded provider — routing a
 * charge to Stripe/SSLCommerz/bKash/Nagad, or to no gateway at all for
 * `PAYMENT_PROVIDERS.MANUAL`, is a matter of choosing a registry key,
 * exactly the extension point "prepare the architecture so payment
 * providers can be plugged in later" asks for), and `OrderLookupProvider`
 * (the one real integration point with `modules/order` — see that
 * interface's doc comment for why) — interfaces only, never Prisma
 * directly.
 *
 * No real gateway is wired in for Stripe/SSLCommerz/bKash/Nagad (see
 * `providers/`'s skeletons, deliberately out of scope) — `attemptCharge`/
 * `verify` still genuinely call through the registered `PaymentProvider`
 * for those, and honestly record the resulting `NotImplementedError` as
 * a `FAILED` transaction rather than pretending the gateway succeeded.
 * `PAYMENT_PROVIDERS.MANUAL` (cash on delivery) is the one provider that
 * needs no gateway call at all and works completely for real.
 *
 * Ownership is enforced on every read/mutation via `getOwnedPayment` — a
 * foreign payment is reported as `NotFoundError`, never `ForbiddenError`,
 * the same treatment `modules/cart`/`modules/wishlist`/`modules/address`/
 * `modules/order` give a resource that isn't the caller's.
 */
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentProviders: Partial<Record<PaymentProviderName, PaymentProvider>>,
    private readonly orderLookup: OrderLookupProvider,
  ) {}

  async getById(id: string, actor: AuthenticatedUser): Promise<PaymentResponseDto> {
    const payment = await this.getOwnedPayment(id, actor);
    return paymentMapper.toResponseDto(payment);
  }

  async getByTransactionId(
    transactionId: string,
    actor: AuthenticatedUser,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findByTransactionId(transactionId);
    if (!payment || payment.userId !== actor.id) {
      throw new NotFoundError("Payment not found");
    }
    return paymentMapper.toResponseDto(payment);
  }

  async listForUser(
    actor: AuthenticatedUser,
    query: ParsedQuery,
    filters: PaymentFilterOptions,
  ): Promise<PaginatedResult<PaymentResponseDto>> {
    const result = await this.paymentRepository.findByUserId(actor.id, query, filters);
    return {
      items: result.items.map((payment) => paymentMapper.toResponseDto(payment)),
      meta: result.meta,
    };
  }

  /** "List order payments": every `Payment` ever attempted against
   * `orderId` — ownership is enforced via `OrderLookupProvider` (the
   * order must be the caller's), which transitively guarantees every
   * payment found is too, since `create`/`retry` only ever attribute a
   * new payment to the order's own owner. */
  async listForOrder(orderId: string, actor: AuthenticatedUser): Promise<PaymentResponseDto[]> {
    await this.orderLookup.getOwnedOrder(actor, orderId);
    const payments = await this.paymentRepository.findByOrderId(orderId);
    return payments.map((payment) => paymentMapper.toResponseDto(payment));
  }

  /** "Payment history": every gateway interaction (or gateway-free
   * lifecycle event) recorded against this payment, oldest first. */
  async getTransactions(
    id: string,
    actor: AuthenticatedUser,
  ): Promise<PaymentTransactionResponseDto[]> {
    await this.getOwnedPayment(id, actor);
    const transactions = await this.paymentRepository.findTransactionsByPaymentId(id);
    return paymentMapper.toTransactionResponseList(transactions);
  }

  /**
   * "Create payment": validates the order (owned by `actor`, not
   * cancelled, and the requested `amount`/`currency` matches its actual
   * total — "validate order before payment"), rejects a second attempt
   * against an already-paid order ("prevent duplicate successful
   * payments"), then creates the `Payment` row and immediately attempts
   * to charge it (`attemptCharge`).
   */
  async create(dto: CreatePaymentDto, actor: AuthenticatedUser): Promise<PaymentResponseDto> {
    const order = await this.orderLookup.getOwnedOrder(actor, dto.orderId);
    this.assertOrderPayable(order, dto.amount, dto.currency);
    await this.assertNoDuplicateSuccessfulPayment(dto.orderId);

    const payment = await this.paymentRepository.create({
      orderId: dto.orderId,
      userId: actor.id,
      method: dto.method,
      provider: dto.provider,
      amount: dto.amount,
      currency: dto.currency,
      status: PAYMENT_STATUSES.PENDING,
      metadata: dto.metadata ?? null,
    });

    logger.info(
      {
        paymentId: payment.id,
        transactionId: payment.transactionId,
        orderId: dto.orderId,
        actorId: actor.id,
      },
      "Payment created",
    );
    return this.attemptCharge(payment);
  }

  /** "Payment retry": creates a *new* `Payment` row for the same order
   * (see `PaymentRepository`'s doc comment on why retrying never
   * resurrects the old one) reusing its method/provider/amount/currency
   * unless `dto` overrides them, then attempts to charge it exactly
   * like `create`. */
  async retry(
    id: string,
    dto: RetryPaymentDto,
    actor: AuthenticatedUser,
  ): Promise<PaymentResponseDto> {
    const existing = await this.getOwnedPayment(id, actor);
    if (!RETRYABLE_STATUSES.includes(existing.status)) {
      throw new ConflictError(`Payment in status "${existing.status}" cannot be retried`);
    }
    await this.assertNoDuplicateSuccessfulPayment(existing.orderId);

    const created = await this.paymentRepository.create({
      orderId: existing.orderId,
      userId: actor.id,
      method: dto.method ?? existing.method,
      provider: dto.provider ?? existing.provider,
      amount: existing.amount,
      currency: existing.currency,
      status: PAYMENT_STATUSES.PENDING,
      metadata: existing.metadata,
    });

    logger.info({ paymentId: created.id, retriedFrom: id, actorId: actor.id }, "Payment retried");
    return this.attemptCharge(created);
  }

  /** "Payment verification": asks the payment's own gateway to confirm
   * `dto.providerRef`'s outcome. Cash-on-delivery payments have no
   * gateway to ask — see `markCashOnDeliveryCollected` instead. */
  async verify(
    id: string,
    dto: VerifyPaymentDto,
    actor: AuthenticatedUser,
  ): Promise<PaymentResponseDto> {
    const payment = await this.getOwnedPayment(id, actor);
    if (payment.provider === PAYMENT_PROVIDERS.MANUAL) {
      throw new BadRequestError(
        "Cash-on-delivery payments have no gateway to verify — mark it collected instead",
      );
    }
    const provider = this.resolveProvider(payment.provider);

    try {
      const result = await provider.verify(dto.providerRef);
      const status =
        result.status === PAYMENT_TRANSACTION_STATUSES.SUCCEEDED
          ? PAYMENT_STATUSES.SUCCEEDED
          : PAYMENT_STATUSES.FAILED;

      const updated = await this.paymentRepository.recordOutcome(id, status, {
        type: PAYMENT_TRANSACTION_TYPES.VERIFICATION,
        status: result.status,
        amount: result.amount,
        providerRef: dto.providerRef,
        errorMessage: result.errorMessage,
      });
      logger.info({ paymentId: id, status, actorId: actor.id }, "Payment verified");
      return paymentMapper.toResponseDto(updated);
    } catch (error) {
      const message = this.describeError(error);
      const updated = await this.paymentRepository.recordOutcome(id, PAYMENT_STATUSES.FAILED, {
        type: PAYMENT_TRANSACTION_TYPES.VERIFICATION,
        status: PAYMENT_TRANSACTION_STATUSES.FAILED,
        amount: { amount: payment.amount, currency: payment.currency },
        providerRef: dto.providerRef,
        errorMessage: message,
      });
      logger.warn({ paymentId: id, error: message }, "Payment verification failed");
      return paymentMapper.toResponseDto(updated);
    }
  }

  /** "Payment cancellation": only valid before any money has actually
   * moved (`isCancellable`) — money that already moved needs a refund,
   * explicitly out of scope for this API (see `providers/`'s `refund`
   * skeletons). No gateway call: there is nothing to reverse yet. */
  async cancel(
    id: string,
    dto: CancelPaymentDto,
    actor: AuthenticatedUser,
  ): Promise<PaymentResponseDto> {
    const payment = await this.getOwnedPayment(id, actor);
    if (!isCancellable(payment.status)) {
      throw new ConflictError(`Payment in status "${payment.status}" can no longer be cancelled`);
    }

    const updated = await this.paymentRepository.recordOutcome(id, PAYMENT_STATUSES.CANCELLED, {
      type: PAYMENT_TRANSACTION_TYPES.CANCELLATION,
      status: PAYMENT_TRANSACTION_STATUSES.SUCCEEDED,
      amount: { amount: payment.amount, currency: payment.currency },
      errorMessage: dto.reason ?? null,
    });
    logger.info({ paymentId: id, actorId: actor.id }, "Payment cancelled");
    return paymentMapper.toResponseDto(updated);
  }

  /** The cash-on-delivery equivalent of a gateway `verify` call — there
   * is no gateway to ask, so a human (the customer or staff handling
   * the delivery) confirms it directly. Only ever valid for
   * `PAYMENT_PROVIDERS.MANUAL`. */
  async markCashOnDeliveryCollected(
    id: string,
    actor: AuthenticatedUser,
  ): Promise<PaymentResponseDto> {
    const payment = await this.getOwnedPayment(id, actor);
    if (payment.provider !== PAYMENT_PROVIDERS.MANUAL) {
      throw new BadRequestError("Only cash-on-delivery payments can be marked collected");
    }
    if (!canTransitionPaymentStatus(payment.status, PAYMENT_STATUSES.SUCCEEDED)) {
      throw new ConflictError(`Payment in status "${payment.status}" cannot be marked collected`);
    }

    const updated = await this.paymentRepository.recordOutcome(id, PAYMENT_STATUSES.SUCCEEDED, {
      type: PAYMENT_TRANSACTION_TYPES.CAPTURE,
      status: PAYMENT_TRANSACTION_STATUSES.SUCCEEDED,
      amount: { amount: payment.amount, currency: payment.currency },
    });
    logger.info({ paymentId: id, actorId: actor.id }, "Cash-on-delivery payment marked collected");
    return paymentMapper.toResponseDto(updated);
  }

  private async getOwnedPayment(id: string, actor: AuthenticatedUser): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id);
    if (!payment || payment.userId !== actor.id) {
      throw new NotFoundError("Payment not found");
    }
    return payment;
  }

  private assertOrderPayable(order: OrderPaymentSnapshot, amount: number, currency: string): void {
    if (order.status === UNPAYABLE_ORDER_STATUS) {
      throw new ConflictError("Cannot pay for a cancelled order");
    }
    if (order.total !== amount) {
      throw new BadRequestError(
        `Payment amount ${amount} does not match the order's total of ${order.total}`,
      );
    }
    if (order.currency !== currency) {
      throw new BadRequestError(
        `Payment currency "${currency}" does not match the order's currency "${order.currency}"`,
      );
    }
  }

  /** "Prevent duplicate successful payments": an order with any
   * `SUCCEEDED`/`PARTIALLY_REFUNDED` payment already attached has been
   * paid — a second successful charge would double-collect. */
  private async assertNoDuplicateSuccessfulPayment(orderId: string): Promise<void> {
    const payments = await this.paymentRepository.findByOrderId(orderId);
    const alreadyPaid = payments.some(
      (payment) =>
        isSuccessful(payment.status) || payment.status === PAYMENT_STATUSES.PARTIALLY_REFUNDED,
    );
    if (alreadyPaid) {
      throw new ConflictError("This order has already been paid");
    }
  }

  /** Cash on delivery needs no gateway call at all — see
   * `PAYMENT_PROVIDERS.MANUAL`'s doc comment — so the payment simply
   * stays `PENDING` until `markCashOnDeliveryCollected` confirms it.
   * Every other provider genuinely goes through the registered
   * `PaymentProvider.charge`; since none of Stripe/SSLCommerz/bKash/
   * Nagad has a real gateway wired in (see this class's doc comment),
   * that call throws, and the honest outcome — `FAILED`, with the
   * thrown error's message recorded — is what gets persisted. Nothing
   * here pretends an unintegrated gateway succeeded.
   */
  private async attemptCharge(payment: Payment): Promise<PaymentResponseDto> {
    if (payment.provider === PAYMENT_PROVIDERS.MANUAL) {
      logger.info(
        { paymentId: payment.id },
        "Cash-on-delivery payment created; awaiting collection",
      );
      return paymentMapper.toResponseDto(payment);
    }

    const provider = this.resolveProvider(payment.provider);
    try {
      const result = await provider.charge({
        paymentId: payment.id,
        amount: { amount: payment.amount, currency: payment.currency },
      });
      const updated = await this.paymentRepository.recordOutcome(
        payment.id,
        PAYMENT_STATUSES.PROCESSING,
        {
          type: PAYMENT_TRANSACTION_TYPES.AUTHORIZATION,
          status: result.status,
          amount: result.amount,
          providerRef: result.providerRef,
          errorMessage: result.errorMessage,
        },
      );
      return paymentMapper.toResponseDto(updated);
    } catch (error) {
      const message = this.describeError(error);
      const updated = await this.paymentRepository.recordOutcome(
        payment.id,
        PAYMENT_STATUSES.FAILED,
        {
          type: PAYMENT_TRANSACTION_TYPES.AUTHORIZATION,
          status: PAYMENT_TRANSACTION_STATUSES.FAILED,
          amount: { amount: payment.amount, currency: payment.currency },
          errorMessage: message,
        },
      );
      logger.warn(
        { paymentId: payment.id, provider: payment.provider, error: message },
        "Payment gateway charge failed",
      );
      return paymentMapper.toResponseDto(updated);
    }
  }

  private resolveProvider(name: PaymentProviderName): PaymentProvider {
    const provider = this.paymentProviders[name];
    if (!provider) {
      throw new InternalServerError(`No payment provider is registered for "${name}"`);
    }
    return provider;
  }

  private describeError(error: unknown): string {
    return error instanceof Error ? error.message : "Unknown payment gateway error";
  }
}
