import {
  FULFILLMENT_STATUSES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
} from "../../modules/order/constants";
import { formatOrderNumber } from "../../modules/order/utils";
import { randomTestId } from "../utils";

import { createFactory } from "./factory.util";

import type { AddressSnapshot, Order } from "../../modules/order/types";

const TEST_ADDRESS_SNAPSHOT: AddressSnapshot = {
  recipientName: "Test Recipient",
  phone: null,
  line1: "123 Test St",
  line2: null,
  city: "Dhaka",
  district: null,
  division: "Dhaka Division",
  postalCode: "1207",
  country: "BD",
};

export const createTestOrder = createFactory<Order>(() => {
  const sequenceNumber = Math.floor(Math.random() * 1_000_000) + 1;
  return {
    id: randomTestId("order"),
    orderNumber: formatOrderNumber(sequenceNumber),
    sequenceNumber,
    userId: randomTestId("user"),
    guestEmail: null,
    status: ORDER_STATUSES.PENDING,
    paymentStatus: PAYMENT_STATUSES.PENDING,
    fulfillmentStatus: FULFILLMENT_STATUSES.UNFULFILLED,
    billingAddressId: randomTestId("address"),
    shippingAddressId: randomTestId("address"),
    billingAddress: TEST_ADDRESS_SNAPSHOT,
    shippingAddress: TEST_ADDRESS_SNAPSHOT,
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
  };
});
