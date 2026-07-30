import type { FulfillmentStatus, OrderStatus, PaymentStatus } from "../constants";
import type { OrderItemResponseDto } from "./order-item-response.dto";
import type { OrderSummaryDto } from "./order-summary.dto";

/**
 * The public-facing shape of an Order, including its items and summary
 * — the realistic "get my order" response shape, mirroring
 * `modules/cart`'s `CartResponseDto`.
 */
export interface OrderResponseDto {
  id: string;
  orderNumber: string;
  userId: string | null;
  guestEmail: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  billingAddressId: string;
  shippingAddressId: string;
  couponCode: string | null;
  notes: string | null;
  items: OrderItemResponseDto[];
  summary: OrderSummaryDto;
  createdAt: Date;
  updatedAt: Date;
}
