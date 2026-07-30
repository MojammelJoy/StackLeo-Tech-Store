import { NotImplementedError } from "../../../errors";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type {
  CreateOrderDto,
  UpdateFulfillmentStatusDto,
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
} from "../dto";
import type { OrderFilterOptions } from "../interfaces";
import type { OrderRepository } from "../repository";
import type { Order, OrderItem, OrderSummary } from "../types";

/**
 * Skeleton order service — the operations a concrete implementation
 * will expose once order persistence exists. Depends on
 * `OrderRepository` (interface only; see `repository/`), never on
 * Prisma directly, so this class never changes when the persistence
 * layer does. Every method throws `NotImplementedError` — no database
 * operations, no price/address lookups, and no business rules (whether
 * a status transition is valid, applying a coupon, reserving stock,
 * etc.) happen in this foundation.
 *
 * Guest vs. registered-user orders are two distinct entry points
 * (`createGuestOrder`/`createUserOrder`, `findByGuestEmail`/
 * `findByUserId`), mirroring `modules/cart`/`modules/wishlist`.
 * `updateStatus`/`updatePaymentStatus`/`updateFulfillmentStatus` are
 * kept separate for the same reason `OrderRepository` keeps them
 * separate. `cancel` is a thin, named convenience over `updateStatus`
 * for the single most common transition — still just a throw here.
 * Nothing here checks `actor`'s permissions; that is `modules/rbac`'s
 * job, applied by whatever middleware sits in front of this service
 * once it exists.
 */
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async findById(id: string): Promise<Order | null> {
    throw new NotImplementedError(`OrderService.findById is not implemented yet (id: ${id})`);
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    throw new NotImplementedError(
      `OrderService.findByOrderNumber is not implemented yet (orderNumber: ${orderNumber})`,
    );
  }

  async findByUserId(
    userId: string,
    _query: ParsedQuery,
    _filters?: OrderFilterOptions,
    _actor?: AuthenticatedUser,
  ): Promise<PaginatedResult<Order>> {
    throw new NotImplementedError(
      `OrderService.findByUserId is not implemented yet (userId: ${userId})`,
    );
  }

  async findByGuestEmail(
    guestEmail: string,
    _query: ParsedQuery,
    _filters?: OrderFilterOptions,
  ): Promise<PaginatedResult<Order>> {
    throw new NotImplementedError(
      `OrderService.findByGuestEmail is not implemented yet (guestEmail: ${guestEmail})`,
    );
  }

  async createGuestOrder(_dto: CreateOrderDto): Promise<Order> {
    throw new NotImplementedError("OrderService.createGuestOrder is not implemented yet");
  }

  async createUserOrder(_dto: CreateOrderDto, _actor: AuthenticatedUser): Promise<Order> {
    throw new NotImplementedError("OrderService.createUserOrder is not implemented yet");
  }

  async getItems(orderId: string): Promise<OrderItem[]> {
    throw new NotImplementedError(
      `OrderService.getItems is not implemented yet (orderId: ${orderId})`,
    );
  }

  async getSummary(orderId: string): Promise<OrderSummary> {
    throw new NotImplementedError(
      `OrderService.getSummary is not implemented yet (orderId: ${orderId})`,
    );
  }

  async updateStatus(
    id: string,
    _dto: UpdateOrderStatusDto,
    _actor: AuthenticatedUser,
  ): Promise<Order> {
    throw new NotImplementedError(`OrderService.updateStatus is not implemented yet (id: ${id})`);
  }

  async updatePaymentStatus(
    id: string,
    _dto: UpdatePaymentStatusDto,
    _actor?: AuthenticatedUser,
  ): Promise<Order> {
    throw new NotImplementedError(
      `OrderService.updatePaymentStatus is not implemented yet (id: ${id})`,
    );
  }

  async updateFulfillmentStatus(
    id: string,
    _dto: UpdateFulfillmentStatusDto,
    _actor?: AuthenticatedUser,
  ): Promise<Order> {
    throw new NotImplementedError(
      `OrderService.updateFulfillmentStatus is not implemented yet (id: ${id})`,
    );
  }

  async cancel(id: string, _actor: AuthenticatedUser): Promise<Order> {
    throw new NotImplementedError(`OrderService.cancel is not implemented yet (id: ${id})`);
  }
}
