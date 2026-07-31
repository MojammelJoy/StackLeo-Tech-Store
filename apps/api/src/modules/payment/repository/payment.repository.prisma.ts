import { prisma } from "../../../database";
import { NotImplementedError } from "../../../errors";

import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { PaymentFilterOptions } from "../interfaces";
import type {
  CreatePaymentInput,
  CreatePaymentTransactionInput,
  Payment,
  PaymentTransaction,
  UpdatePaymentInput,
} from "../types";
import type { PaymentRepository } from "./payment.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `PaymentRepository` — currently a
 * skeleton. Every method throws `NotImplementedError` rather than
 * querying `prisma`, because no `Payment`/`PaymentTransaction` model
 * exists in `prisma/schema.prisma` yet; adding one is out of scope for
 * this foundation. Defaults to the shared `prisma` client from
 * `database/` (never constructs its own connection) so only the method
 * bodies are left to fill in once a model exists.
 */
export class PaymentPrismaRepository implements PaymentRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string): Promise<Payment | null> {
    throw new NotImplementedError(
      `PaymentPrismaRepository.findById is not implemented yet (id: ${id})`,
    );
  }

  async findByOrderId(orderId: string): Promise<Payment[]> {
    throw new NotImplementedError(
      `PaymentPrismaRepository.findByOrderId is not implemented yet (orderId: ${orderId})`,
    );
  }

  async findByProviderRef(providerRef: string): Promise<Payment | null> {
    throw new NotImplementedError(
      `PaymentPrismaRepository.findByProviderRef is not implemented yet (providerRef: ${providerRef})`,
    );
  }

  async findAll(
    _query: ParsedQuery,
    _filters?: PaymentFilterOptions,
  ): Promise<PaginatedResult<Payment>> {
    throw new NotImplementedError("PaymentPrismaRepository.findAll is not implemented yet");
  }

  async create(_data: CreatePaymentInput): Promise<Payment> {
    throw new NotImplementedError("PaymentPrismaRepository.create is not implemented yet");
  }

  async update(id: string, _data: UpdatePaymentInput): Promise<Payment> {
    throw new NotImplementedError(
      `PaymentPrismaRepository.update is not implemented yet (id: ${id})`,
    );
  }

  async findTransactionsByPaymentId(paymentId: string): Promise<PaymentTransaction[]> {
    throw new NotImplementedError(
      `PaymentPrismaRepository.findTransactionsByPaymentId is not implemented yet (paymentId: ${paymentId})`,
    );
  }

  async addTransaction(_data: CreatePaymentTransactionInput): Promise<PaymentTransaction> {
    throw new NotImplementedError("PaymentPrismaRepository.addTransaction is not implemented yet");
  }
}
