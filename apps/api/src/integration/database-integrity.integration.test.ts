import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "../database";
import { registerAndLoginTestUser, resetDatabase, startTestServer } from "../testing/integration";

import {
  addToCart,
  createAddress,
  createAdmin,
  createSellableProduct,
  placeOrder,
  stockProduct,
} from "./fixtures";

import type { TestServer } from "../testing/integration";

/**
 * A full, realistic slice of the business lifecycle (order, payment,
 * coupon, review, notification), then an explicit orphan sweep across
 * every relationship the production hardening task calls out. Real
 * Prisma `@relation` foreign keys (OrderItem→Order,
 * PaymentTransaction→Payment, CouponRedemption→Coupon,
 * ReviewHelpfulVote→Review, OrderStatusHistory→Order) are enforced by
 * Postgres itself with `onDelete: Cascade` — they can never actually
 * orphan through normal application writes, so this checks them anyway
 * as a regression guard, but the more meaningful checks are the bare,
 * FK-*shaped*-but-unenforced columns this schema deliberately uses for
 * cross-module decoupling (`Payment.orderId`, `Review.productId`/
 * `userId`, `Notification.userId`, `CouponRedemption.userId`) — see
 * `prisma/schema.prisma`'s `Product`/`Cart`/`Order` doc comments for why
 * those are bare fields, not relations.
 */
describe("database integrity (integration)", () => {
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

  it("leaves no orphan rows after a realistic order/payment/review/coupon/notification lifecycle", async () => {
    const admin = await createAdmin(server.baseUrl);
    const product = await createSellableProduct(admin);
    await stockProduct(admin, product.sku, 10);

    const coupon = await admin.client.post<{ data: { coupon: { id: string; code: string } } }>(
      "/api/v1/coupons",
      {
        code: `INTEG${Date.now().toString(36).toUpperCase().slice(-6)}`,
        discountType: "fixed_amount",
        discountValue: 100,
        currency: "USD",
      },
    );
    await admin.client.patch(`/api/v1/coupons/${coupon.body.data.coupon.id}`, { status: "active" });

    const buyer = await registerAndLoginTestUser(server.baseUrl);
    const address = await createAddress(buyer);
    await addToCart(buyer, product, 1);
    await buyer.client.post("/api/v1/coupons/apply", { code: coupon.body.data.coupon.code });

    const placed = await placeOrder(buyer, {
      billingAddressId: address.id,
      shippingAddressId: address.id,
    });
    expect(placed.status).toBe(201);
    const orderId = placed.order?.id as string;

    const payment = await buyer.client.post<{ data: { payment: { id: string } } }>(
      "/api/v1/payments",
      {
        orderId,
        method: "cash_on_delivery",
        provider: "manual",
        amount: placed.order?.summary.total,
        currency: placed.order?.summary.currency,
      },
    );
    await buyer.client.post(`/api/v1/payments/${payment.body.data.payment.id}/collect`);

    await admin.client.patch(`/api/v1/admin/orders/${orderId}/status`, { status: "confirmed" });
    await admin.client.patch(`/api/v1/admin/orders/${orderId}/status`, { status: "processing" });
    await admin.client.patch(`/api/v1/admin/orders/${orderId}/status`, { status: "completed" });

    const review = await buyer.client.post<{ data: { review: { id: string } } }>(
      "/api/v1/reviews",
      {
        productId: product.id,
        rating: 5,
        body: "Integrity-check review body, long enough to pass validation.",
      },
    );
    const voter = await registerAndLoginTestUser(server.baseUrl);
    await voter.client.post(`/api/v1/reviews/${review.body.data.review.id}/vote`, {
      helpful: true,
    });

    await buyer.client.post("/api/v1/notifications", {
      type: "transactional",
      body: "Integrity-check notification body.",
    });

    // --- Orphan sweep ---

    const orderIds = new Set(
      (await prisma.order.findMany({ select: { id: true } })).map((o) => o.id),
    );
    const userIds = new Set(
      (await prisma.user.findMany({ select: { id: true } })).map((u) => u.id),
    );
    const productIds = new Set(
      (await prisma.product.findMany({ select: { id: true } })).map((p) => p.id),
    );
    const couponIds = new Set(
      (await prisma.coupon.findMany({ select: { id: true } })).map((c) => c.id),
    );
    const paymentIds = new Set(
      (await prisma.payment.findMany({ select: { id: true } })).map((p) => p.id),
    );
    const reviewIds = new Set(
      (await prisma.review.findMany({ select: { id: true } })).map((r) => r.id),
    );

    const orderItems = await prisma.orderItem.findMany();
    expect(orderItems.every((item) => orderIds.has(item.orderId))).toBe(true);

    const statusHistory = await prisma.orderStatusHistory.findMany();
    expect(statusHistory.every((entry) => orderIds.has(entry.orderId))).toBe(true);

    const payments = await prisma.payment.findMany();
    expect(payments.every((p) => orderIds.has(p.orderId))).toBe(true);
    expect(payments.every((p) => p.userId === null || userIds.has(p.userId))).toBe(true);

    const paymentTransactions = await prisma.paymentTransaction.findMany();
    expect(paymentTransactions.every((t) => paymentIds.has(t.paymentId))).toBe(true);

    const couponRedemptions = await prisma.couponRedemption.findMany();
    expect(couponRedemptions.every((r) => couponIds.has(r.couponId))).toBe(true);
    expect(couponRedemptions.every((r) => userIds.has(r.userId))).toBe(true);

    const reviews = await prisma.review.findMany();
    expect(reviews.every((r) => productIds.has(r.productId))).toBe(true);
    expect(reviews.every((r) => userIds.has(r.userId))).toBe(true);

    const reviewVotes = await prisma.reviewHelpfulVote.findMany();
    expect(reviewVotes.every((v) => reviewIds.has(v.reviewId))).toBe(true);
    expect(reviewVotes.every((v) => userIds.has(v.userId))).toBe(true);

    const ratingSummaries = await prisma.reviewRatingSummary.findMany();
    expect(ratingSummaries.every((s) => productIds.has(s.productId))).toBe(true);
    // Every rating summary row must correspond to at least one real,
    // non-orphaned review for that product (the aggregate should never
    // outlive every review it summarizes).
    for (const summary of ratingSummaries) {
      if (summary.totalReviews > 0) {
        const count = await prisma.review.count({ where: { productId: summary.productId } });
        expect(count).toBeGreaterThan(0);
      }
    }

    const notifications = await prisma.notification.findMany();
    expect(notifications.every((n) => n.userId === null || userIds.has(n.userId))).toBe(true);
  });
});
