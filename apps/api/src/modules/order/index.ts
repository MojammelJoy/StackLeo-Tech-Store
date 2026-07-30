/**
 * Reusable order infrastructure: domain types (order + item + summary),
 * DTOs + Zod validation schemas (built from reusable field-level
 * schemas in `schemas/`), the repository contract (plus its currently-
 * skeletal Prisma implementation), a skeleton service, and the mapper/
 * utility helpers that support it all. Three independent status
 * dimensions (order/payment/fulfillment lifecycle) and decoupled
 * future-integration shapes for inventory reservation, payment, and
 * shipment. No controllers, routes, CRUD implementation, or business
 * logic (payment/shipment/inventory concerns) live here.
 */
export {
  FULFILLMENT_STATUSES,
  ORDER_COUPON_CODE_MAX_LENGTH,
  ORDER_CURRENCY_CODE_LENGTH,
  ORDER_FILTERABLE_FIELDS,
  ORDER_ITEM_MAX_QUANTITY,
  ORDER_ITEM_MIN_QUANTITY,
  ORDER_MIN_ITEM_COUNT,
  ORDER_NOTES_MAX_LENGTH,
  ORDER_NUMBER_SEQUENCE_PAD_LENGTH,
  ORDER_SORTABLE_FIELDS,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from "./constants";
export type { FulfillmentStatus, OrderStatus, PaymentStatus } from "./constants";

export type {
  CreateOrderInput,
  CreateOrderItemInput,
  Order,
  OrderItem,
  OrderSummary,
  UpdateOrderInput,
} from "./types";

export { couponCodeSchema, notesSchema, quantitySchema } from "./schemas";

export {
  addOrderItemSchema,
  createOrderSchema,
  updateFulfillmentStatusSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
} from "./validation";
export type {
  AddOrderItemDto,
  CreateOrderDto,
  OrderItemResponseDto,
  OrderResponseDto,
  OrderSummaryDto,
  UpdateFulfillmentStatusDto,
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
} from "./dto";

export type {
  InventoryReservationRequest,
  OrderFilterOptions,
  OrderMapper,
  PaymentReference,
  ShipmentReference,
} from "./interfaces";

export {
  buildOrderSummary,
  calculateItemCount,
  calculateLineTotal,
  formatOrderNumber,
  getOrderNumberPrefix,
  isCancellable,
  isPaid,
} from "./utils";

export { orderMapper } from "./mapper";

export { OrderPrismaRepository } from "./repository";
export type { OrderRepository } from "./repository";

export { OrderService } from "./service";
