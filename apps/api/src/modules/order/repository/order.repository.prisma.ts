import { prisma } from "../../../database";
import { NotImplementedError } from "../../../errors";

import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { FulfillmentStatus, OrderStatus, PaymentStatus } from "../constants";
import type { OrderFilterOptions } from "../interfaces";
import type { CreateOrderInput, Order, OrderItem, UpdateOrderInput } from "../types";
import type { OrderRepository } from "./order.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `OrderRepository` — currently a
 * skeleton. Every method throws `NotImplementedError` rather than
 * querying `prisma`, because no `Order`/`OrderItem` model exists in
 * `prisma/schema.prisma` yet; adding one is out of scope for this
 * foundation. Defaults to the shared `prisma` client from `database/`
 * (never constructs its own connection) so only the method bodies are
 * left to fill in once those models exist.
 */
export class OrderPrismaRepository implements OrderRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string): Promise<Order | null> {
    throw new NotImplementedError(
      `OrderPrismaRepository.findById is not implemented yet (id: ${id})`,
    );
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    throw new NotImplementedError(
      `OrderPrismaRepository.findByOrderNumber is not implemented yet (orderNumber: ${orderNumber})`,
    );
  }

  async findByUserId(
    userId: string,
    _query: ParsedQuery,
    _filters?: OrderFilterOptions,
  ): Promise<PaginatedResult<Order>> {
    throw new NotImplementedError(
      `OrderPrismaRepository.findByUserId is not implemented yet (userId: ${userId})`,
    );
  }

  async findByGuestEmail(
    guestEmail: string,
    _query: ParsedQuery,
    _filters?: OrderFilterOptions,
  ): Promise<PaginatedResult<Order>> {
    throw new NotImplementedError(
      `OrderPrismaRepository.findByGuestEmail is not implemented yet (guestEmail: ${guestEmail})`,
    );
  }

  async create(_data: CreateOrderInput): Promise<Order> {
    throw new NotImplementedError("OrderPrismaRepository.create is not implemented yet");
  }

  async update(id: string, _data: UpdateOrderInput): Promise<Order> {
    throw new NotImplementedError(
      `OrderPrismaRepository.update is not implemented yet (id: ${id})`,
    );
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    throw new NotImplementedError(
      `OrderPrismaRepository.updateStatus is not implemented yet (id: ${id}, status: ${status})`,
    );
  }

  async updatePaymentStatus(id: string, status: PaymentStatus): Promise<Order> {
    throw new NotImplementedError(
      `OrderPrismaRepository.updatePaymentStatus is not implemented yet (id: ${id}, status: ${status})`,
    );
  }

  async updateFulfillmentStatus(id: string, status: FulfillmentStatus): Promise<Order> {
    throw new NotImplementedError(
      `OrderPrismaRepository.updateFulfillmentStatus is not implemented yet (id: ${id}, status: ${status})`,
    );
  }

  async findItemsByOrderId(orderId: string): Promise<OrderItem[]> {
    throw new NotImplementedError(
      `OrderPrismaRepository.findItemsByOrderId is not implemented yet (orderId: ${orderId})`,
    );
  }
}
