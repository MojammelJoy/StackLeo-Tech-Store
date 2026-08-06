/**
 * The Order API: domain types (order + item + status history +
 * summary + address snapshot), DTOs + Zod validation schemas (built
 * from reusable field-level schemas in `schemas/`), the repository
 * contract plus its Prisma implementation (order/item/history
 * persistence, transactional inventory deduction, plus a
 * `ProductSnapshotRepository` for read-only product facts — see that
 * interface's doc comment for why), the mapper/utility helpers that
 * support it all, and the controller/routes exposing it at
 * `/api/v1/orders`. Authenticated users only — placing an order reuses
 * `modules/cart` (via `CartCheckoutProvider`) and `modules/address`
 * (via `AddressSnapshotProvider`) rather than reimplementing either.
 * Payment gateway/shipment tracking/invoice/notification/refund
 * concerns are explicitly out of scope.
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
  ORDER_STATUS_TRANSITIONS,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from "./constants";
export type { FulfillmentStatus, OrderStatus, PaymentStatus } from "./constants";

export type {
  AddressSnapshot,
  CreateOrderInput,
  CreateOrderItemInput,
  CreateOrderStatusHistoryInput,
  Order,
  OrderItem,
  OrderStatusHistoryEntry,
  OrderSummary,
  UpdateOrderInput,
} from "./types";

export { couponCodeSchema, notesSchema } from "./schemas";

export {
  cancelOrderSchema,
  createOrderSchema,
  orderIdParamsSchema,
  orderNumberParamsSchema,
  updateFulfillmentStatusSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
} from "./validation";
export type {
  CancelOrderDto,
  CreateOrderDto,
  OrderItemResponseDto,
  OrderResponseDto,
  OrderSummaryDto,
  OrderTimelineEntryDto,
  UpdateFulfillmentStatusDto,
  UpdateOrderStatusDto,
  UpdatePaymentStatusDto,
} from "./dto";

export type {
  AddressSnapshotProvider,
  CartCheckoutItem,
  CartCheckoutProvider,
  CartCheckoutSource,
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
  canTransitionOrderStatus,
  formatOrderNumber,
  getOrderNumberPrefix,
  isCancellable,
  isPaid,
  parseOrderNumber,
} from "./utils";

export { orderMapper } from "./mapper";

export { OrderPrismaRepository, ProductSnapshotPrismaRepository } from "./repository";
export type {
  OrderRepository,
  ProductOrderSnapshot,
  ProductSnapshotRepository,
} from "./repository";

export { OrderService } from "./service";

export { OrderController } from "./controller";

export { orderRouter } from "./routes";
