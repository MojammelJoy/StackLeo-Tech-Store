import type { PaginatedResult, ParsedQuery } from "../../../common";
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
 */
export interface PaymentRepository {
  findById(id: string): Promise<Payment | null>;
  findByOrderId(orderId: string): Promise<Payment[]>;
  findByProviderRef(providerRef: string): Promise<Payment | null>;
  findAll(query: ParsedQuery, filters?: PaymentFilterOptions): Promise<PaginatedResult<Payment>>;
  create(data: CreatePaymentInput): Promise<Payment>;
  update(id: string, data: UpdatePaymentInput): Promise<Payment>;
  findTransactionsByPaymentId(paymentId: string): Promise<PaymentTransaction[]>;
  addTransaction(data: CreatePaymentTransactionInput): Promise<PaymentTransaction>;
}
