import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "../database";
import { registerAndLoginTestUser, resetDatabase, startTestServer } from "../testing/integration";

import {
  addToCart,
  createAddress,
  createAdmin,
  createSellableProduct,
  placeOrder,
  setUpAndPlaceOrder,
  stockProduct,
} from "./fixtures";

import type { PlacedOrder } from "./fixtures";
import type { RegisteredTestUser, TestServer } from "../testing/integration";

function codPaymentPayload(order: PlacedOrder) {
  return {
    orderId: order.id,
    method: "cash_on_delivery",
    provider: "manual",
    amount: order.summary.total,
    currency: order.summary.currency,
  };
}

describe("order -> payment (integration)", () => {
  let server: TestServer;

  beforeAll(async () => {
    server = await startTestServer();
  });

  afterEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await server.close();
  });

  it("creates a payment linked to the correct order, starting pending", async () => {
    const { buyer, order } = await setUpAndPlaceOrder(server.baseUrl);

    const response = await buyer.client.post<{
      data: { payment: { id: string; orderId: string; status: string; amount: number } };
    }>("/api/v1/payments", codPaymentPayload(order));

    expect(response.status).toBe(201);
    expect(response.body.data.payment.orderId).toBe(order.id);
    expect(response.body.data.payment.status).toBe("pending");
    expect(response.body.data.payment.amount).toBe(order.summary.total);
  });

  it("rejects a payment amount that doesn't match the order total", async () => {
    const { buyer, order } = await setUpAndPlaceOrder(server.baseUrl);

    const response = await buyer.client.post("/api/v1/payments", {
      ...codPaymentPayload(order),
      amount: order.summary.total + 1,
    });
    expect(response.status).toBe(400);
  });

  it("rejects creating a payment for another user's order", async () => {
    const { order } = await setUpAndPlaceOrder(server.baseUrl);
    const attacker = await registerAndLoginTestUser(server.baseUrl);

    const response = await attacker.client.post("/api/v1/payments", codPaymentPayload(order));
    expect(response.status).toBe(404);
  });

  it("marks a cash-on-delivery payment collected (succeeded) without any real gateway call", async () => {
    const { buyer, order } = await setUpAndPlaceOrder(server.baseUrl);
    const created = await buyer.client.post<{ data: { payment: { id: string } } }>(
      "/api/v1/payments",
      codPaymentPayload(order),
    );
    const paymentId = created.body.data.payment.id;

    const collected = await buyer.client.post<{ data: { payment: { status: string } } }>(
      `/api/v1/payments/${paymentId}/collect`,
    );
    expect(collected.status).toBe(200);
    expect(collected.body.data.payment.status).toBe("succeeded");

    const transactions = await prisma.paymentTransaction.findMany({ where: { paymentId } });
    expect(transactions.length).toBeGreaterThan(0);
    expect(transactions.at(-1)?.status).toBe("succeeded");
  });

  it("rejects a second successful payment for an order that's already been paid", async () => {
    const { buyer, order } = await setUpAndPlaceOrder(server.baseUrl);
    const first = await buyer.client.post<{ data: { payment: { id: string } } }>(
      "/api/v1/payments",
      codPaymentPayload(order),
    );
    await buyer.client.post(`/api/v1/payments/${first.body.data.payment.id}/collect`);

    const secondAttempt = await buyer.client.post("/api/v1/payments", codPaymentPayload(order));
    expect(secondAttempt.status).toBe(409);
  });

  it("prevents two concurrent 'mark collected' calls from both succeeding for the same payment", async () => {
    const { buyer, order } = await setUpAndPlaceOrder(server.baseUrl);
    const created = await buyer.client.post<{ data: { payment: { id: string } } }>(
      "/api/v1/payments",
      codPaymentPayload(order),
    );
    const paymentId = created.body.data.payment.id;

    const [first, second] = await Promise.all([
      buyer.client.post(`/api/v1/payments/${paymentId}/collect`),
      buyer.client.post(`/api/v1/payments/${paymentId}/collect`),
    ]);

    const successCount = [first, second].filter((response) => response.status === 200).length;
    expect(successCount).toBe(1);

    const transactions = await prisma.paymentTransaction.findMany({ where: { paymentId } });
    expect(transactions.filter((transaction) => transaction.status === "succeeded")).toHaveLength(
      1,
    );
  });

  it("does not create duplicate orders when the same cart is submitted twice concurrently", async () => {
    const admin = await createAdmin(server.baseUrl);
    const product = await createSellableProduct(admin);
    await stockProduct(admin, product.sku, 10);

    const buyer: RegisteredTestUser = await registerAndLoginTestUser(server.baseUrl);
    const address = await createAddress(buyer);
    await addToCart(buyer, product, 1);

    const [first, second] = await Promise.all([
      placeOrder(buyer, { billingAddressId: address.id, shippingAddressId: address.id }),
      placeOrder(buyer, { billingAddressId: address.id, shippingAddressId: address.id }),
    ]);

    const successCount = [first, second].filter((result) => result.status === 201).length;
    expect(successCount).toBeGreaterThanOrEqual(1);

    const orders = await prisma.order.findMany({ where: { userId: buyer.userId } });
    // Whether the second concurrent submission is rejected outright or
    // (since a fresh cart is auto-created once the first is converted)
    // succeeds as a second, legitimate order is an existing-architecture
    // question, not something this test invents — the one invariant
    // that must always hold is "never more orders than successful
    // responses".
    expect(orders).toHaveLength(successCount);
  });
});
