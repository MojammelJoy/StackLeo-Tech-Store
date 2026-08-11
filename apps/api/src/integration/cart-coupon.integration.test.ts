import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "../database";
import {
  TestHttpClient,
  registerAndLoginTestUser,
  resetDatabase,
  startTestServer,
} from "../testing/integration";

import { createAdmin, createProductVariant, createSellableProduct, stockProduct } from "./fixtures";

import type { RegisteredTestUser, TestServer } from "../testing/integration";

async function activateCoupon(admin: RegisteredTestUser, couponId: string): Promise<void> {
  const response = await admin.client.patch(`/api/v1/coupons/${couponId}`, { status: "active" });
  if (response.status !== 200) {
    throw new Error(`Failed to activate coupon: ${JSON.stringify(response.body)}`);
  }
}

describe("cart + coupon (integration)", () => {
  let server: TestServer;
  let admin: RegisteredTestUser;

  beforeAll(async () => {
    server = await startTestServer();
  });

  afterEach(async () => {
    await resetDatabase();
  });

  afterAll(async () => {
    await server.close();
  });

  async function freshAdmin(): Promise<RegisteredTestUser> {
    admin = await createAdmin(server.baseUrl);
    return admin;
  }

  describe("cart", () => {
    it("adds a sellable, in-stock product to the cart and reflects it in the summary", async () => {
      const staff = await freshAdmin();
      const product = await createSellableProduct(staff);
      await stockProduct(staff, product.sku, 10);

      const { client } = await registerAndLoginTestUser(server.baseUrl);
      const response = await client.post<{
        data: {
          cart: {
            items: Array<{ productId: string; quantity: number }>;
            summary: { total: number };
          };
        };
      }>("/api/v1/cart/items", { productId: product.id, sku: product.sku, quantity: 2 });

      expect(response.status).toBe(201);
      expect(response.body.data.cart.items).toHaveLength(1);
      expect(response.body.data.cart.items[0].quantity).toBe(2);
      expect(response.body.data.cart.summary.total).toBe(product.price * 2);
    });

    it("rejects adding a draft/private (unavailable) product", async () => {
      const staff = await freshAdmin();
      const product = await createSellableProduct(staff, {
        status: "draft",
        visibility: "private",
      });

      const { client } = await registerAndLoginTestUser(server.baseUrl);
      const response = await client.post("/api/v1/cart/items", {
        productId: product.id,
        sku: product.sku,
        quantity: 1,
      });

      expect(response.status).toBe(404);
    });

    it("rejects adding more than the available inventory", async () => {
      const staff = await freshAdmin();
      const product = await createSellableProduct(staff);
      await stockProduct(staff, product.sku, 2);

      const { client } = await registerAndLoginTestUser(server.baseUrl);
      const response = await client.post("/api/v1/cart/items", {
        productId: product.id,
        sku: product.sku,
        quantity: 3,
      });

      expect(response.status).toBe(409);
    });

    it("rejects an invalid quantity (zero, negative, and over the max)", async () => {
      const staff = await freshAdmin();
      const product = await createSellableProduct(staff);
      await stockProduct(staff, product.sku, 500);

      const { client } = await registerAndLoginTestUser(server.baseUrl);

      const zero = await client.post("/api/v1/cart/items", {
        productId: product.id,
        sku: product.sku,
        quantity: 0,
      });
      const negative = await client.post("/api/v1/cart/items", {
        productId: product.id,
        sku: product.sku,
        quantity: -1,
      });
      const tooMany = await client.post("/api/v1/cart/items", {
        productId: product.id,
        sku: product.sku,
        quantity: 100,
      });

      expect(zero.status).toBe(400);
      expect(negative.status).toBe(400);
      expect(tooMany.status).toBe(400);
    });

    it("updates quantity and removes an item", async () => {
      const staff = await freshAdmin();
      const product = await createSellableProduct(staff);
      await stockProduct(staff, product.sku, 10);

      const { client } = await registerAndLoginTestUser(server.baseUrl);
      const added = await client.post<{ data: { cart: { items: Array<{ id: string }> } } }>(
        "/api/v1/cart/items",
        { productId: product.id, sku: product.sku, quantity: 1 },
      );
      const itemId = added.body.data.cart.items[0].id;

      const updated = await client.patch<{
        data: { cart: { items: Array<{ id: string; quantity: number }> } };
      }>(`/api/v1/cart/items/${itemId}`, { quantity: 4 });
      expect(updated.status).toBe(200);
      expect(updated.body.data.cart.items[0].quantity).toBe(4);

      const removed = await client.delete<{ data: { cart: { items: unknown[] } } }>(
        `/api/v1/cart/items/${itemId}`,
      );
      expect(removed.status).toBe(200);
      expect(removed.body.data.cart.items).toHaveLength(0);
    });
  });

  describe("cart variants", () => {
    it("adds an active variant using the variant's own sku and price", async () => {
      const staff = await freshAdmin();
      const product = await createSellableProduct(staff, { price: 2500 });
      const variant = await createProductVariant(staff, product.id, { price: 4200 });
      await stockProduct(staff, variant.sku, 10);

      const { client } = await registerAndLoginTestUser(server.baseUrl);
      const response = await client.post<{
        data: {
          cart: {
            items: Array<{ productId: string; sku: string; unitPrice: number; quantity: number }>;
            summary: { total: number };
          };
        };
      }>("/api/v1/cart/items", { productId: product.id, sku: variant.sku, quantity: 1 });

      expect(response.status).toBe(201);
      expect(response.body.data.cart.items).toHaveLength(1);
      expect(response.body.data.cart.items[0].sku).toBe(variant.sku);
      expect(response.body.data.cart.items[0].unitPrice).toBe(4200);
      expect(response.body.data.cart.summary.total).toBe(4200);
    });

    it("falls back to the base product's price when the variant has no price override", async () => {
      const staff = await freshAdmin();
      const product = await createSellableProduct(staff, { price: 2500 });
      const variant = await createProductVariant(staff, product.id, { price: null });
      await stockProduct(staff, variant.sku, 10);

      const { client } = await registerAndLoginTestUser(server.baseUrl);
      const response = await client.post<{
        data: { cart: { items: Array<{ unitPrice: number }> } };
      }>("/api/v1/cart/items", { productId: product.id, sku: variant.sku, quantity: 1 });

      expect(response.status).toBe(201);
      expect(response.body.data.cart.items[0].unitPrice).toBe(2500);
    });

    it("rejects an inactive variant", async () => {
      const staff = await freshAdmin();
      const product = await createSellableProduct(staff);
      const variant = await createProductVariant(staff, product.id, { isActive: false });
      await stockProduct(staff, variant.sku, 10);

      const { client } = await registerAndLoginTestUser(server.baseUrl);
      const response = await client.post("/api/v1/cart/items", {
        productId: product.id,
        sku: variant.sku,
        quantity: 1,
      });

      expect(response.status).toBe(404);
    });

    it("rejects a variant sku that doesn't exist for the product", async () => {
      const staff = await freshAdmin();
      const product = await createSellableProduct(staff);

      const { client } = await registerAndLoginTestUser(server.baseUrl);
      const response = await client.post("/api/v1/cart/items", {
        productId: product.id,
        sku: "NO-SUCH-VARIANT-SKU",
        quantity: 1,
      });

      expect(response.status).toBe(400);
    });

    it("rejects adding a variant beyond its own available stock", async () => {
      const staff = await freshAdmin();
      const product = await createSellableProduct(staff);
      const variant = await createProductVariant(staff, product.id);
      await stockProduct(staff, variant.sku, 2);

      const { client } = await registerAndLoginTestUser(server.baseUrl);
      const response = await client.post("/api/v1/cart/items", {
        productId: product.id,
        sku: variant.sku,
        quantity: 3,
      });

      expect(response.status).toBe(409);
    });

    it("supports quantity updates on a variant line", async () => {
      const staff = await freshAdmin();
      const product = await createSellableProduct(staff);
      const variant = await createProductVariant(staff, product.id);
      await stockProduct(staff, variant.sku, 10);

      const { client } = await registerAndLoginTestUser(server.baseUrl);
      const added = await client.post<{ data: { cart: { items: Array<{ id: string }> } } }>(
        "/api/v1/cart/items",
        { productId: product.id, sku: variant.sku, quantity: 1 },
      );
      const itemId = added.body.data.cart.items[0].id;

      const updated = await client.patch<{
        data: { cart: { items: Array<{ quantity: number }> } };
      }>(`/api/v1/cart/items/${itemId}`, { quantity: 5 });

      expect(updated.status).toBe(200);
      expect(updated.body.data.cart.items[0].quantity).toBe(5);
    });

    it("keeps two different variants of the same product as separate cart lines", async () => {
      const staff = await freshAdmin();
      const product = await createSellableProduct(staff);
      const variantA = await createProductVariant(staff, product.id, {
        sku: `VARIANT-A-${product.sku}`,
      });
      const variantB = await createProductVariant(staff, product.id, {
        sku: `VARIANT-B-${product.sku}`,
      });
      await stockProduct(staff, variantA.sku, 10);
      await stockProduct(staff, variantB.sku, 10);

      const { client } = await registerAndLoginTestUser(server.baseUrl);
      await client.post("/api/v1/cart/items", {
        productId: product.id,
        sku: variantA.sku,
        quantity: 1,
      });
      await client.post("/api/v1/cart/items", {
        productId: product.id,
        sku: variantB.sku,
        quantity: 1,
      });

      const cart = await client.get<{ data: { cart: { items: Array<{ sku: string }> } } }>(
        "/api/v1/cart",
      );

      expect(cart.body.data.cart.items).toHaveLength(2);
      expect(cart.body.data.cart.items.map((item) => item.sku).sort()).toEqual(
        [variantA.sku, variantB.sku].sort(),
      );
    });

    it("still exposes the base product's own sku unchanged (no regression)", async () => {
      const staff = await freshAdmin();
      const product = await createSellableProduct(staff, { price: 1800 });
      await stockProduct(staff, product.sku, 10);

      const { client } = await registerAndLoginTestUser(server.baseUrl);
      const response = await client.post<{
        data: { cart: { items: Array<{ sku: string; unitPrice: number }> } };
      }>("/api/v1/cart/items", { productId: product.id, sku: product.sku, quantity: 1 });

      expect(response.status).toBe(201);
      expect(response.body.data.cart.items[0].sku).toBe(product.sku);
      expect(response.body.data.cart.items[0].unitPrice).toBe(1800);
    });
  });

  describe("guest cart", () => {
    it("creates a guest cart and adds a base product via the guest token header", async () => {
      const staff = await freshAdmin();
      const product = await createSellableProduct(staff, { price: 3000 });
      await stockProduct(staff, product.sku, 10);

      const anon = new TestHttpClient(server.baseUrl);
      const created = await anon.post<{ data: { cart: { guestToken: string } } }>(
        "/api/v1/cart/guest",
        {},
      );
      expect(created.status).toBe(201);
      const guestToken = created.body.data.cart.guestToken;
      expect(guestToken).toBeTruthy();

      const added = await anon.post<{
        data: { cart: { items: Array<{ sku: string; unitPrice: number }> } };
      }>(
        "/api/v1/cart/items",
        { productId: product.id, sku: product.sku, quantity: 1 },
        { "x-guest-token": guestToken },
      );
      expect(added.status).toBe(201);
      expect(added.body.data.cart.items[0].sku).toBe(product.sku);

      const fetched = await anon.get<{ data: { cart: { items: unknown[] } } }>("/api/v1/cart", {
        "x-guest-token": guestToken,
      });
      expect(fetched.status).toBe(200);
      expect(fetched.body.data.cart.items).toHaveLength(1);
    });

    it("adds an active variant to a guest cart via the guest token header", async () => {
      const staff = await freshAdmin();
      const product = await createSellableProduct(staff);
      const variant = await createProductVariant(staff, product.id, { price: 5500 });
      await stockProduct(staff, variant.sku, 10);

      const anon = new TestHttpClient(server.baseUrl);
      const created = await anon.post<{ data: { cart: { guestToken: string } } }>(
        "/api/v1/cart/guest",
        {},
      );
      const guestToken = created.body.data.cart.guestToken;

      const added = await anon.post<{
        data: { cart: { items: Array<{ sku: string; unitPrice: number }> } };
      }>(
        "/api/v1/cart/items",
        { productId: product.id, sku: variant.sku, quantity: 1 },
        { "x-guest-token": guestToken },
      );

      expect(added.status).toBe(201);
      expect(added.body.data.cart.items[0].sku).toBe(variant.sku);
      expect(added.body.data.cart.items[0].unitPrice).toBe(5500);
    });

    it("rejects a cart request with neither a session nor a guest token", async () => {
      const anon = new TestHttpClient(server.baseUrl);
      const response = await anon.get("/api/v1/cart");
      expect(response.status).toBe(400);
    });

    it("merges a guest cart's variant line into the authenticated user's cart after login", async () => {
      const staff = await freshAdmin();
      const product = await createSellableProduct(staff);
      const variant = await createProductVariant(staff, product.id, { price: 1234 });
      await stockProduct(staff, variant.sku, 10);

      const anon = new TestHttpClient(server.baseUrl);
      const guestCreated = await anon.post<{ data: { cart: { guestToken: string } } }>(
        "/api/v1/cart/guest",
        {},
      );
      const guestToken = guestCreated.body.data.cart.guestToken;
      await anon.post(
        "/api/v1/cart/items",
        { productId: product.id, sku: variant.sku, quantity: 2 },
        { "x-guest-token": guestToken },
      );

      const { client } = await registerAndLoginTestUser(server.baseUrl);
      const merged = await client.post<{
        data: { cart: { items: Array<{ sku: string; quantity: number; unitPrice: number }> } };
      }>("/api/v1/cart/merge", undefined, { "x-guest-token": guestToken });

      expect(merged.status).toBe(200);
      expect(merged.body.data.cart.items).toHaveLength(1);
      expect(merged.body.data.cart.items[0].sku).toBe(variant.sku);
      expect(merged.body.data.cart.items[0].quantity).toBe(2);
      expect(merged.body.data.cart.items[0].unitPrice).toBe(1234);

      // The guest cart's own view is now merged — its token no longer
      // resolves an active cart.
      const guestAfterMerge = await anon.get("/api/v1/cart", { "x-guest-token": guestToken });
      expect(guestAfterMerge.status).toBe(404);
    });
  });

  describe("coupon", () => {
    async function createDraftCoupon(
      staff: RegisteredTestUser,
      overrides: Record<string, unknown> = {},
    ): Promise<{ id: string; code: string }> {
      const code = `SAVE${Date.now().toString(36).toUpperCase().slice(-6)}${Math.floor(
        Math.random() * 1000,
      )}`;
      const response = await staff.client.post<{ data: { coupon: { id: string; code: string } } }>(
        "/api/v1/coupons",
        {
          code,
          discountType: "percentage",
          discountValue: 10,
          currency: "USD",
          stackable: false,
          ...overrides,
        },
      );
      if (response.status !== 201) {
        throw new Error(`Failed to create coupon: ${JSON.stringify(response.body)}`);
      }
      return response.body.data.coupon;
    }

    it("validates a real, active, applicable coupon successfully", async () => {
      const staff = await freshAdmin();
      const product = await createSellableProduct(staff);
      await stockProduct(staff, product.sku, 10);
      const coupon = await createDraftCoupon(staff);
      await activateCoupon(staff, coupon.id);

      const { client } = await registerAndLoginTestUser(server.baseUrl);
      await client.post("/api/v1/cart/items", {
        productId: product.id,
        sku: product.sku,
        quantity: 2,
      });

      const validation = await client.post<{ data: { valid: boolean; errorCode: string | null } }>(
        "/api/v1/coupons/validate",
        { code: coupon.code },
      );
      expect(validation.status).toBe(200);
      expect(validation.body.data.valid).toBe(true);
      expect(validation.body.data.errorCode).toBeNull();
    });

    it("reports a nonexistent coupon code as not_found", async () => {
      const { client } = await registerAndLoginTestUser(server.baseUrl);
      const response = await client.post<{ data: { valid: boolean; errorCode: string } }>(
        "/api/v1/coupons/validate",
        { code: "DOES-NOT-EXIST" },
      );
      expect(response.body.data.valid).toBe(false);
      expect(response.body.data.errorCode).toBe("not_found");
    });

    it("reports a draft (never-activated) coupon as inactive", async () => {
      const staff = await freshAdmin();
      const coupon = await createDraftCoupon(staff);

      const { client } = await registerAndLoginTestUser(server.baseUrl);
      const response = await client.post<{ data: { valid: boolean; errorCode: string } }>(
        "/api/v1/coupons/validate",
        { code: coupon.code },
      );
      expect(response.body.data.valid).toBe(false);
      expect(response.body.data.errorCode).toBe("inactive");
    });

    it("reports an expired coupon as expired", async () => {
      const staff = await freshAdmin();
      const coupon = await createDraftCoupon(staff, {
        startsAt: new Date(Date.now() - 60_000).toISOString(),
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      });
      await activateCoupon(staff, coupon.id);
      // Move the coupon into the past directly — simulating "time has
      // passed" deterministically, without waiting or fighting the
      // create schema's own future-expiry validation.
      await prisma.coupon.update({
        where: { id: coupon.id },
        data: { expiresAt: new Date(Date.now() - 1000) },
      });

      const { client } = await registerAndLoginTestUser(server.baseUrl);
      const response = await client.post<{ data: { valid: boolean; errorCode: string } }>(
        "/api/v1/coupons/validate",
        { code: coupon.code },
      );
      expect(response.body.data.valid).toBe(false);
      expect(response.body.data.errorCode).toBe("expired");
    });

    it("reports minOrderAmount not met", async () => {
      const staff = await freshAdmin();
      const product = await createSellableProduct(staff, { price: 500 });
      await stockProduct(staff, product.sku, 10);
      const coupon = await createDraftCoupon(staff, { minOrderAmount: 10_000 });
      await activateCoupon(staff, coupon.id);

      const { client } = await registerAndLoginTestUser(server.baseUrl);
      await client.post("/api/v1/cart/items", {
        productId: product.id,
        sku: product.sku,
        quantity: 1,
      });

      const response = await client.post<{ data: { valid: boolean; errorCode: string } }>(
        "/api/v1/coupons/validate",
        { code: coupon.code },
      );
      expect(response.body.data.valid).toBe(false);
      expect(response.body.data.errorCode).toBe("min_order_amount_not_met");
    });

    it("applies a coupon, computes the correct discount, and records a redemption", async () => {
      const staff = await freshAdmin();
      const product = await createSellableProduct(staff, { price: 1000 });
      await stockProduct(staff, product.sku, 10);
      const coupon = await createDraftCoupon(staff, {
        discountType: "percentage",
        discountValue: 20,
      });
      await activateCoupon(staff, coupon.id);

      const { client } = await registerAndLoginTestUser(server.baseUrl);
      await client.post("/api/v1/cart/items", {
        productId: product.id,
        sku: product.sku,
        quantity: 2,
      });

      const applied = await client.post<{
        data: { discountAmount: number; coupon: { usageCount: number } };
      }>("/api/v1/coupons/apply", { code: coupon.code });

      expect(applied.status).toBe(201);
      expect(applied.body.data.discountAmount).toBe(400); // 20% of 2000
      expect(applied.body.data.coupon.usageCount).toBe(1);

      const redemptions = await prisma.couponRedemption.findMany({
        where: { couponId: coupon.id },
      });
      expect(redemptions).toHaveLength(1);
      expect(redemptions[0].removedAt).toBeNull();
    });

    it("rejects applying the same coupon twice to the same cart", async () => {
      const staff = await freshAdmin();
      const product = await createSellableProduct(staff);
      await stockProduct(staff, product.sku, 10);
      const coupon = await createDraftCoupon(staff);
      await activateCoupon(staff, coupon.id);

      const { client } = await registerAndLoginTestUser(server.baseUrl);
      await client.post("/api/v1/cart/items", {
        productId: product.id,
        sku: product.sku,
        quantity: 1,
      });
      await client.post("/api/v1/coupons/apply", { code: coupon.code });

      const secondApply = await client.post("/api/v1/coupons/apply", { code: coupon.code });
      expect(secondApply.status).toBe(409);
    });

    it("removes a coupon from the cart, soft-marking the redemption", async () => {
      const staff = await freshAdmin();
      const product = await createSellableProduct(staff);
      await stockProduct(staff, product.sku, 10);
      const coupon = await createDraftCoupon(staff);
      await activateCoupon(staff, coupon.id);

      const { client } = await registerAndLoginTestUser(server.baseUrl);
      await client.post("/api/v1/cart/items", {
        productId: product.id,
        sku: product.sku,
        quantity: 1,
      });
      await client.post("/api/v1/coupons/apply", { code: coupon.code });

      const removed = await client.delete(`/api/v1/coupons/apply/${coupon.code}`);
      expect(removed.status).toBe(200);

      const redemption = await prisma.couponRedemption.findFirst({
        where: { couponId: coupon.id },
      });
      expect(redemption?.removedAt).not.toBeNull();
    });

    it("enforces the global usage limit across different users", async () => {
      const staff = await freshAdmin();
      const product = await createSellableProduct(staff);
      await stockProduct(staff, product.sku, 10);
      const coupon = await createDraftCoupon(staff, { usageLimit: 1 });
      await activateCoupon(staff, coupon.id);

      const first = await registerAndLoginTestUser(server.baseUrl);
      await first.client.post("/api/v1/cart/items", {
        productId: product.id,
        sku: product.sku,
        quantity: 1,
      });
      const firstApply = await first.client.post("/api/v1/coupons/apply", { code: coupon.code });
      expect(firstApply.status).toBe(201);

      const second = await registerAndLoginTestUser(server.baseUrl);
      await second.client.post("/api/v1/cart/items", {
        productId: product.id,
        sku: product.sku,
        quantity: 1,
      });
      const secondValidate = await second.client.post<{
        data: { valid: boolean; errorCode: string };
      }>("/api/v1/coupons/validate", { code: coupon.code });
      expect(secondValidate.body.data.valid).toBe(false);
      expect(secondValidate.body.data.errorCode).toBe("usage_limit_reached");
    });

    it("never lets two simultaneous redemptions both succeed against a usage-limit-1 coupon", async () => {
      const staff = await freshAdmin();
      const product = await createSellableProduct(staff);
      await stockProduct(staff, product.sku, 10);
      const coupon = await createDraftCoupon(staff, { usageLimit: 1 });
      await activateCoupon(staff, coupon.id);

      const first = await registerAndLoginTestUser(server.baseUrl);
      await first.client.post("/api/v1/cart/items", {
        productId: product.id,
        sku: product.sku,
        quantity: 1,
      });

      const second = await registerAndLoginTestUser(server.baseUrl);
      await second.client.post("/api/v1/cart/items", {
        productId: product.id,
        sku: product.sku,
        quantity: 1,
      });

      const [firstResult, secondResult] = await Promise.all([
        first.client.post("/api/v1/coupons/apply", { code: coupon.code }),
        second.client.post("/api/v1/coupons/apply", { code: coupon.code }),
      ]);

      const successCount = [firstResult, secondResult].filter((r) => r.status === 201).length;
      expect(successCount).toBe(1);

      const activeRedemptions = await prisma.couponRedemption.findMany({
        where: { couponId: coupon.id, removedAt: null },
      });
      expect(activeRedemptions).toHaveLength(1);

      const finalCoupon = await prisma.coupon.findUniqueOrThrow({ where: { id: coupon.id } });
      expect(finalCoupon.usageCount).toBe(1);
    });
  });
});
