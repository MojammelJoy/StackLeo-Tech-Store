import { buildPaginationMeta, getPaginationOffset } from "../../../common";
import { prisma } from "../../../database";
import { ConflictError } from "../../../errors";
import { PAYMENT_STATUSES, PAYMENT_TRANSACTION_STATUSES } from "../constants";
import { formatPaymentReference, parsePaymentReference } from "../utils";

import type { PaginatedResult, ParsedQuery, SortParam } from "../../../common";
import type {
  CurrencyCode,
  PaymentMethod,
  PaymentProviderName,
  PaymentStatus,
  PaymentTransactionStatus,
  PaymentTransactionType,
} from "../constants";
import type { PaymentFilterOptions } from "../interfaces";
import type {
  CreatePaymentInput,
  CreatePaymentTransactionInput,
  Payment,
  PaymentTransaction,
  UpdatePaymentInput,
} from "../types";
import type { PaymentRepository } from "./payment.repository";
import type {
  Payment as PrismaPayment,
  PaymentTransaction as PrismaPaymentTransaction,
  Prisma,
  PrismaClient,
} from "@prisma/client";

/** Prisma's generated model type stores `method`/`provider`/`status`/
 * `currency` as plain `string` (they're `String` columns, not native
 * Postgres enums — see `prisma/schema.prisma`'s doc comment on
 * `Payment`, which mirrors `Order`). This is the one place that narrows
 * them back to this module's literal unions, and derives the
 * customer-facing `transactionId` from the stored `sequenceNumber` —
 * every row only ever got there through this repository, so both are
 * safe. */
function toDomainPayment(row: PrismaPayment): Payment {
  return {
    ...row,
    transactionId: formatPaymentReference(row.sequenceNumber),
    method: row.method as PaymentMethod,
    provider: row.provider as PaymentProviderName,
    status: row.status as PaymentStatus,
    currency: row.currency as CurrencyCode,
    metadata: row.metadata as unknown as Record<string, unknown> | null,
  };
}

function toDomainPaymentList(rows: PrismaPayment[]): Payment[] {
  return rows.map(toDomainPayment);
}

function toDomainTransaction(row: PrismaPaymentTransaction): PaymentTransaction {
  return {
    id: row.id,
    paymentId: row.paymentId,
    type: row.type as PaymentTransactionType,
    status: row.status as PaymentTransactionStatus,
    amount: { amount: row.amount, currency: row.currency as CurrencyCode },
    providerRef: row.providerRef,
    errorMessage: row.errorMessage,
    createdAt: row.createdAt,
  };
}

function toDomainTransactionList(rows: PrismaPaymentTransaction[]): PaymentTransaction[] {
  return rows.map(toDomainTransaction);
}

/**
 * Prisma-backed implementation of `PaymentRepository`. Defaults to the
 * shared `prisma` client from `database/` (never constructs its own
 * connection), matching every other module's Prisma repository.
 */
export class PaymentPrismaRepository implements PaymentRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string): Promise<Payment | null> {
    const row = await this.prismaClient.payment.findUnique({ where: { id } });
    return row ? toDomainPayment(row) : null;
  }

  async findByTransactionId(transactionId: string): Promise<Payment | null> {
    const sequenceNumber = parsePaymentReference(transactionId);
    if (sequenceNumber === null) {
      return null;
    }
    const row = await this.prismaClient.payment.findUnique({ where: { sequenceNumber } });
    return row ? toDomainPayment(row) : null;
  }

  async findByProviderRef(providerRef: string): Promise<Payment | null> {
    const row = await this.prismaClient.payment.findFirst({ where: { providerRef } });
    return row ? toDomainPayment(row) : null;
  }

  async findByOrderId(orderId: string): Promise<Payment[]> {
    const rows = await this.prismaClient.payment.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });
    return toDomainPaymentList(rows);
  }

  async findByUserId(
    userId: string,
    query: ParsedQuery,
    filters: PaymentFilterOptions = {},
  ): Promise<PaginatedResult<Payment>> {
    return this.findMany({ userId }, query, filters);
  }

  async findAll(
    query: ParsedQuery,
    filters: PaymentFilterOptions = {},
  ): Promise<PaginatedResult<Payment>> {
    return this.findMany({}, query, filters);
  }

  private async findMany(
    identity: Prisma.PaymentWhereInput,
    query: ParsedQuery,
    filters: PaymentFilterOptions,
  ): Promise<PaginatedResult<Payment>> {
    const where = buildWhere(identity, filters);
    const orderBy = buildOrderBy(query.sort);
    const { pagination } = query;
    const { skip, take } = getPaginationOffset(pagination);

    const [rows, totalItems] = await Promise.all([
      this.prismaClient.payment.findMany({ where, orderBy, skip, take }),
      this.prismaClient.payment.count({ where }),
    ]);

    return {
      items: toDomainPaymentList(rows),
      meta: buildPaginationMeta(pagination, totalItems),
    };
  }

  async create(data: CreatePaymentInput): Promise<Payment> {
    const row = await this.prismaClient.payment.create({
      data: {
        orderId: data.orderId,
        userId: data.userId ?? null,
        method: data.method,
        provider: data.provider,
        status: data.status ?? PAYMENT_STATUSES.PENDING,
        amount: data.amount,
        currency: data.currency,
        providerRef: data.providerRef ?? null,
        metadata: (data.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
    return toDomainPayment(row);
  }

  async update(id: string, data: UpdatePaymentInput): Promise<Payment> {
    const row = await this.prismaClient.payment.update({
      where: { id },
      data: { status: data.status, providerRef: data.providerRef },
    });
    return toDomainPayment(row);
  }

  /** Runs the status update and the explaining `PaymentTransaction`
   * insert inside one `$transaction` — "use Prisma transactions where
   * appropriate": these two writes must never be observed independently
   * (a status change with no record of why, or a transaction row for a
   * status the payment was never actually moved to). */
  /** The `status` update is conditioned on `expectedCurrentStatus` via
   * `updateMany`'s `WHERE`, not a plain `update` by `id` alone. Without
   * this, two concurrent outcome recordings for the same payment (e.g.
   * two simultaneous "mark collected" calls, or a retried gateway
   * callback racing a user-initiated cancel) can both pass the
   * service's read-then-decide status-transition check
   * (`canTransitionPaymentStatus`/`isCancellable`, evaluated outside
   * any transaction) before either has written, letting the payment be
   * "captured" twice — two `PaymentTransaction` rows recording the same
   * money movement as if it happened twice. A `count === 0` result
   * means another transaction already changed the status away from
   * `expectedCurrentStatus` by the time this write ran, so it throws
   * `ConflictError` instead of recording a second, contradictory
   * outcome — the same atomic-conditional-update fix
   * `modules/order/repository/order.repository.prisma.ts`'s
   * `deductInventory` and `modules/coupon/repository/coupon.repository.prisma.ts`'s
   * `applyRedemption` already apply to their own concurrent-write
   * races. Never retried: once the status has genuinely moved on,
   * retrying the same outcome doesn't make sense — the caller re-reads
   * and re-validates from scratch on their next request instead. */
  async recordOutcome(
    id: string,
    status: PaymentStatus,
    expectedCurrentStatus: PaymentStatus,
    transaction: Omit<CreatePaymentTransactionInput, "paymentId">,
  ): Promise<Payment> {
    const updated = await this.prismaClient.$transaction(async (tx) => {
      const result = await tx.payment.updateMany({
        where: { id, status: expectedCurrentStatus },
        data: {
          status,
          ...(transaction.providerRef !== undefined
            ? { providerRef: transaction.providerRef }
            : {}),
        },
      });

      if (result.count === 0) {
        throw new ConflictError(
          `Payment "${id}" is no longer in status "${expectedCurrentStatus}" — it may have already been updated concurrently`,
        );
      }

      await tx.paymentTransaction.create({
        data: {
          paymentId: id,
          type: transaction.type,
          status: transaction.status ?? PAYMENT_TRANSACTION_STATUSES.PENDING,
          amount: transaction.amount.amount,
          currency: transaction.amount.currency,
          providerRef: transaction.providerRef ?? null,
          errorMessage: transaction.errorMessage ?? null,
        },
      });
      return tx.payment.findUniqueOrThrow({ where: { id } });
    });
    return toDomainPayment(updated);
  }

  async findTransactionsByPaymentId(paymentId: string): Promise<PaymentTransaction[]> {
    const rows = await this.prismaClient.paymentTransaction.findMany({
      where: { paymentId },
      orderBy: { createdAt: "asc" },
    });
    return toDomainTransactionList(rows);
  }

  async addTransaction(data: CreatePaymentTransactionInput): Promise<PaymentTransaction> {
    const row = await this.prismaClient.paymentTransaction.create({
      data: {
        paymentId: data.paymentId,
        type: data.type,
        status: data.status ?? PAYMENT_TRANSACTION_STATUSES.PENDING,
        amount: data.amount.amount,
        currency: data.amount.currency,
        providerRef: data.providerRef ?? null,
        errorMessage: data.errorMessage ?? null,
      },
    });
    return toDomainTransaction(row);
  }
}

function buildWhere(
  identity: Prisma.PaymentWhereInput,
  filters: PaymentFilterOptions,
): Prisma.PaymentWhereInput {
  const conditions: Prisma.PaymentWhereInput[] = [identity];

  if (filters.status) {
    conditions.push({ status: filters.status });
  }
  if (filters.method) {
    conditions.push({ method: filters.method });
  }
  if (filters.provider) {
    conditions.push({ provider: filters.provider });
  }

  return { AND: conditions };
}

/** Always appends an `id` tiebreaker for deterministic ordering across
 * pages when the primary sort field ties, mirroring every other
 * module's Prisma repository. */
function buildOrderBy(sort: SortParam[]): Prisma.PaymentOrderByWithRelationInput[] {
  if (sort.length === 0) return [{ createdAt: "desc" }, { id: "asc" }];
  return [...sort.map(({ field, order }) => ({ [field]: order })), { id: "asc" }];
}
