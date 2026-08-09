import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { PaymentStatus } from "../constants";
import type { PaymentFilterOptions } from "../interfaces";
import type {
  CreatePaymentInput,
  CreatePaymentTransactionInput,
  Payment,
  PaymentTransaction,
  UpdatePaymentInput,
} from "../types";

/**
 * Persistence contract for the Payment domain entity and its
 * transaction history. The service depends on this interface, never on
 * a concrete implementation directly, so swapping `PaymentPrismaRepository`
 * for a test double (or a different persistence layer entirely) never
 * touches service code. `findByOrderId` returns an array — an order can
 * accumulate more than one `Payment` record over its life (a failed card
 * attempt followed by a successful retry, for instance).
 *
 * `recordOutcome` exists as its own method rather than a separate
 * `update` + `addTransaction` call from the service: it updates the
 * payment's `status` and appends the `PaymentTransaction` explaining why
 * atomically, in one `$transaction` — see
 * `PaymentPrismaRepository.recordOutcome`'s doc comment.
 */
export interface PaymentRepository {
  findById(id: string): Promise<Payment | null>;
  findByTransactionId(transactionId: string): Promise<Payment | null>;
  findByProviderRef(providerRef: string): Promise<Payment | null>;
  findByOrderId(orderId: string): Promise<Payment[]>;
  findByUserId(
    userId: string,
    query: ParsedQuery,
    filters?: PaymentFilterOptions,
  ): Promise<PaginatedResult<Payment>>;
  findAll(query: ParsedQuery, filters?: PaymentFilterOptions): Promise<PaginatedResult<Payment>>;
  create(data: CreatePaymentInput): Promise<Payment>;
  update(id: string, data: UpdatePaymentInput): Promise<Payment>;
  /** `expectedCurrentStatus` is the payment's status as the caller last
   * read it (and validated the transition from) — the repository
   * conditions its update on that value still holding, atomically, so
   * two concurrent outcome recordings for the same payment can never
   * both succeed. See `PaymentPrismaRepository.recordOutcome`'s doc
   * comment. */
  recordOutcome(
    id: string,
    status: PaymentStatus,
    expectedCurrentStatus: PaymentStatus,
    transaction: Omit<CreatePaymentTransactionInput, "paymentId">,
  ): Promise<Payment>;
  findTransactionsByPaymentId(paymentId: string): Promise<PaymentTransaction[]>;
  addTransaction(data: CreatePaymentTransactionInput): Promise<PaymentTransaction>;
}
