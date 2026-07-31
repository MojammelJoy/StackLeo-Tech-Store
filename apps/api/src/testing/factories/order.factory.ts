import { randomUUID } from "node:crypto";

import {
  FULFILLMENT_STATUSES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from "../../modules/order/constants";
import { randomTestId } from "../utils";

import { createFactory } from "./factory.util";

import type { Order } from "../../modules/order/types";

export const createTestOrder = createFactory<Order>(() => ({
  id: randomTestId("order"),
  orderNumber: `TEST-ORD-${randomUUID().slice(0, 8).toUpperCase()}`,
  userId: randomTestId("user"),
  guestEmail: null,
  status: ORDER_STATUSES.PENDING,
  paymentStatus: PAYMENT_STATUSES.PENDING,
  fulfillmentStatus: FULFILLMENT_STATUSES.UNFULFILLED,
  billingAddressId: randomTestId("address"),
  shippingAddressId: randomTestId("address"),
  couponCode: null,
  notes: null,
  currency: "USD",
  subtotal: 1999,
  discountTotal: 0,
  taxTotal: 0,
  shippingTotal: 0,
  total: 1999,
  createdAt: new Date(),
  updatedAt: new Date(),
}));
