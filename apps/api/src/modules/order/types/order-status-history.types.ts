import type { OrderStatus } from "../constants";

/**
 * One append-only entry in an order's status timeline — mirrors
 * `prisma/schema.prisma`'s `OrderStatusHistory`. Written once per
 * status transition (including the order's initial status at
 * creation), never updated or deleted; `OrderService`/
 * `OrderRepository` never expose a way to mutate or remove one.
 */
export interface OrderStatusHistoryEntry {
  id: string;
  orderId: string;
  status: OrderStatus;
  note: string | null;
  createdAt: Date;
}

/** Repository-level creation input — no `id`/`createdAt` yet, assigned by the repository. */
export interface CreateOrderStatusHistoryInput {
  orderId: string;
  status: OrderStatus;
  note?: string | null;
}
