import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "../../database";
import { setUpAndPlaceOrder } from "../../integration/fixtures";
import {
  registerAndLoginTestUser,
  resetDatabase,
  startTestServer,
} from "../../testing/integration";

import type { TestServer } from "../../testing/integration";

async function completeOrder(
  admin: Awaited<ReturnType<typeof setUpAndPlaceOrder>>["admin"],
  orderId: string,
): Promise<void> {
  await admin.client.patch(`/api/v1/admin/orders/${orderId}/status`, { status: "confirmed" });
  await admin.client.patch(`/api/v1/admin/orders/${orderId}/status`, { status: "processing" });
  await admin.client.patch(`/api/v1/admin/orders/${orderId}/status`, { status: "completed" });
}

describe("review (integration)", () => {
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

  it("lets a verified purchaser (order status completed) review the product", async () => {
    const { admin, buyer, product, order } = await setUpAndPlaceOrder(server.baseUrl);
    await completeOrder(admin, order.id);

    const response = await buyer.client.post<{
      data: { review: { id: string; productId: string; moderationStatus: string } };
    }>("/api/v1/reviews", {
      productId: product.id,
      rating: 5,
      body: "Great product, worked well.",
    });

    expect(response.status).toBe(201);
    expect(response.body.data.review.productId).toBe(product.id);
  });

  it("rejects a review from someone who never purchased the product", async () => {
    const { product } = await setUpAndPlaceOrder(server.baseUrl);
    const nonBuyer = await registerAndLoginTestUser(server.baseUrl);

    const response = await nonBuyer.client.post("/api/v1/reviews", {
      productId: product.id,
      rating: 4,
      body: "Never actually bought this.",
    });
    expect(response.status).toBe(403);
  });

  it("rejects a review while the purchase order is still pending (not yet completed)", async () => {
    const { buyer, product } = await setUpAndPlaceOrder(server.baseUrl);

    const response = await buyer.client.post("/api/v1/reviews", {
      productId: product.id,
      rating: 5,
      body: "Reviewing before delivery even happened.",
    });
    expect(response.status).toBe(403);
  });

  it("rejects a second active review from the same user for the same product", async () => {
    const { admin, buyer, product, order } = await setUpAndPlaceOrder(server.baseUrl);
    await completeOrder(admin, order.id);

    await buyer.client.post("/api/v1/reviews", {
      productId: product.id,
      rating: 5,
      body: "First review body.",
    });
    const second = await buyer.client.post("/api/v1/reviews", {
      productId: product.id,
      rating: 3,
      body: "Trying to review again.",
    });
    expect(second.status).toBe(409);
  });

  it("updates the product's rating summary after a review is created", async () => {
    const { admin, buyer, product, order } = await setUpAndPlaceOrder(server.baseUrl);
    await completeOrder(admin, order.id);
    await buyer.client.post("/api/v1/reviews", {
      productId: product.id,
      rating: 4,
      body: "Solid, would buy again.",
    });

    const summary = await prisma.reviewRatingSummary.findUnique({
      where: { productId: product.id },
    });
    expect(summary?.totalReviews).toBe(1);
    expect(summary?.averageRating).toBe(4);
  });

  it("records helpful/unhelpful votes and rejects self-voting", async () => {
    const { admin, buyer, product, order } = await setUpAndPlaceOrder(server.baseUrl);
    await completeOrder(admin, order.id);
    const created = await buyer.client.post<{ data: { review: { id: string } } }>(
      "/api/v1/reviews",
      {
        productId: product.id,
        rating: 5,
        body: "Helpful vote test review body.",
      },
    );
    const reviewId = created.body.data.review.id;

    const selfVote = await buyer.client.post(`/api/v1/reviews/${reviewId}/vote`, { helpful: true });
    expect(selfVote.status).toBe(400);

    const voter = await registerAndLoginTestUser(server.baseUrl);
    const vote = await voter.client.post<{
      data: { review: { helpfulCount: number; unhelpfulCount: number } };
    }>(`/api/v1/reviews/${reviewId}/vote`, { helpful: true });
    expect(vote.status).toBe(200);
    expect(vote.body.data.review.helpfulCount).toBe(1);
  });

  it("rejects moderation by a plain member and allows it for an authorized admin", async () => {
    const { admin, buyer, product, order } = await setUpAndPlaceOrder(server.baseUrl);
    await completeOrder(admin, order.id);
    const created = await buyer.client.post<{ data: { review: { id: string } } }>(
      "/api/v1/reviews",
      {
        productId: product.id,
        rating: 2,
        body: "Moderation test review body.",
      },
    );
    const reviewId = created.body.data.review.id;

    const memberAttempt = await buyer.client.patch(`/api/v1/admin/reviews/${reviewId}/moderation`, {
      status: "approved",
    });
    expect(memberAttempt.status).toBe(403);

    const moderated = await admin.client.patch<{
      data: { review: { moderationStatus: string } };
    }>(`/api/v1/admin/reviews/${reviewId}/moderation`, { status: "approved" });
    expect(moderated.status).toBe(200);
    expect(moderated.body.data.review.moderationStatus).toBe("approved");
  });
});
