import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "../../database";
import {
  TestHttpClient,
  elevateToAdmin,
  registerAndLoginTestUser,
  resetDatabase,
  startTestServer,
} from "../../testing/integration";
import { randomTestId } from "../../testing/utils";

import type { TestServer } from "../../testing/integration";

function buildProductPayload(overrides: Record<string, unknown> = {}) {
  const unique = randomTestId("prod");
  return {
    name: `Test Product ${unique}`,
    sku: `SKU-${unique}`,
    price: 1999,
    currency: "USD",
    status: "active",
    visibility: "public",
    ...overrides,
  };
}

describe("product (integration)", () => {
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

  it("rejects product creation by a plain member (no product:create permission)", async () => {
    const { client } = await registerAndLoginTestUser(server.baseUrl);
    const response = await client.post("/api/v1/products", buildProductPayload());
    expect(response.status).toBe(403);
  });

  it("lets an admin create a product", async () => {
    const admin = await registerAndLoginTestUser(server.baseUrl);
    await elevateToAdmin(admin);

    const response = await admin.client.post<{ data: { product: { id: string; sku: string } } }>(
      "/api/v1/products",
      buildProductPayload(),
    );

    expect(response.status).toBe(201);
    expect(response.body.data.product.id).toBeTruthy();
  });

  it("exposes an active/public product to anonymous listing, search, and get-by-id", async () => {
    const admin = await registerAndLoginTestUser(server.baseUrl);
    await elevateToAdmin(admin);
    const created = await admin.client.post<{
      data: { product: { id: string; slug: string; name: string } };
    }>("/api/v1/products", buildProductPayload({ name: "Findable Widget" }));
    const { id, slug } = created.body.data.product;

    const anon = new TestHttpClient(server.baseUrl);

    const byId = await anon.get<{ data: { product: { id: string } } }>(`/api/v1/products/${id}`);
    expect(byId.status).toBe(200);
    expect(byId.body.data.product.id).toBe(id);

    const bySlug = await anon.get<{ data: { product: { id: string } } }>(
      `/api/v1/products/slug/${slug}`,
    );
    expect(bySlug.status).toBe(200);

    const list = await anon.get<{ data: Array<{ id: string }> }>("/api/v1/products");
    expect(list.status).toBe(200);
    expect(list.body.data.some((product) => product.id === id)).toBe(true);

    const search = await anon.get<{ data: Array<{ id: string }> }>(
      "/api/v1/products?search=Findable",
    );
    expect(search.status).toBe(200);
    expect(search.body.data.some((product) => product.id === id)).toBe(true);
  });

  it("never exposes a draft/private product to an anonymous or unprivileged caller", async () => {
    const admin = await registerAndLoginTestUser(server.baseUrl);
    await elevateToAdmin(admin);
    const created = await admin.client.post<{ data: { product: { id: string } } }>(
      "/api/v1/products",
      buildProductPayload({ status: "draft", visibility: "private" }),
    );
    const { id } = created.body.data.product;

    const anon = new TestHttpClient(server.baseUrl);
    const byId = await anon.get(`/api/v1/products/${id}`);
    expect(byId.status).toBe(404);

    const list = await anon.get<{ data: Array<{ id: string }> }>("/api/v1/products");
    expect(list.body.data.some((product) => product.id === id)).toBe(false);
  });

  it("paginates the product list with the standard pagination envelope", async () => {
    const admin = await registerAndLoginTestUser(server.baseUrl);
    await elevateToAdmin(admin);
    for (let i = 0; i < 3; i += 1) {
      await admin.client.post("/api/v1/products", buildProductPayload());
    }

    const anon = new TestHttpClient(server.baseUrl);
    const page = await anon.get<{
      meta: { pagination: { page: number; limit: number; totalItems: number } };
    }>("/api/v1/products?page=1&limit=2");

    expect(page.status).toBe(200);
    expect(page.body.meta.pagination.page).toBe(1);
    expect(page.body.meta.pagination.limit).toBe(2);
    expect(page.body.meta.pagination.totalItems).toBeGreaterThanOrEqual(3);
  });

  it("rejects an invalid pagination/sort/filter request gracefully via existing error architecture", async () => {
    const anon = new TestHttpClient(server.baseUrl);
    const response = await anon.get("/api/v1/products?sort=not_a_real_field:desc");
    // Sorting/pagination in this app is permissive (falls back to safe
    // defaults rather than 400ing) — see common/utils/sorting.utils.ts;
    // the important guarantee is that it never 500s or leaks a raw error.
    expect(response.status).toBe(200);
  });

  describe("GET /products/bulk", () => {
    it("returns visible products for an anonymous caller in requested-id order", async () => {
      const admin = await registerAndLoginTestUser(server.baseUrl);
      await elevateToAdmin(admin);

      const first = await admin.client.post<{ data: { product: { id: string } } }>(
        "/api/v1/products",
        buildProductPayload(),
      );
      const second = await admin.client.post<{ data: { product: { id: string } } }>(
        "/api/v1/products",
        buildProductPayload(),
      );
      const firstId = first.body.data.product.id;
      const secondId = second.body.data.product.id;

      const anon = new TestHttpClient(server.baseUrl);
      // Requested in reverse-creation order, to prove response order
      // follows the request — not creation/database order.
      const response = await anon.get<{
        success: boolean;
        data: { products: Array<{ id: string }> };
        meta: { requestId: string; timestamp: string };
      }>(`/api/v1/products/bulk?ids=${secondId},${firstId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.products.map((product) => product.id)).toEqual([secondId, firstId]);
      expect(response.body.meta.requestId).toBeTruthy();
    });

    it("collapses duplicate ids to a single product in the response", async () => {
      const admin = await registerAndLoginTestUser(server.baseUrl);
      await elevateToAdmin(admin);
      const created = await admin.client.post<{ data: { product: { id: string } } }>(
        "/api/v1/products",
        buildProductPayload(),
      );
      const id = created.body.data.product.id;

      const anon = new TestHttpClient(server.baseUrl);
      const response = await anon.get<{ data: { products: Array<{ id: string }> } }>(
        `/api/v1/products/bulk?ids=${id},${id},${id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.data.products).toHaveLength(1);
    });

    it("does not fail the whole request when some requested ids don't exist", async () => {
      const admin = await registerAndLoginTestUser(server.baseUrl);
      await elevateToAdmin(admin);
      const created = await admin.client.post<{ data: { product: { id: string } } }>(
        "/api/v1/products",
        buildProductPayload(),
      );
      const id = created.body.data.product.id;

      const anon = new TestHttpClient(server.baseUrl);
      const response = await anon.get<{ data: { products: Array<{ id: string }> } }>(
        `/api/v1/products/bulk?ids=${id},nonexistent-id-1,nonexistent-id-2`,
      );

      expect(response.status).toBe(200);
      expect(response.body.data.products.map((product) => product.id)).toEqual([id]);
    });

    it("hides draft, private, and deleted products from an anonymous caller", async () => {
      const admin = await registerAndLoginTestUser(server.baseUrl);
      await elevateToAdmin(admin);

      const visible = await admin.client.post<{ data: { product: { id: string } } }>(
        "/api/v1/products",
        buildProductPayload(),
      );
      const draft = await admin.client.post<{ data: { product: { id: string } } }>(
        "/api/v1/products",
        buildProductPayload({ status: "draft" }),
      );
      const privateProduct = await admin.client.post<{ data: { product: { id: string } } }>(
        "/api/v1/products",
        buildProductPayload({ visibility: "private" }),
      );
      const deleted = await admin.client.post<{ data: { product: { id: string } } }>(
        "/api/v1/products",
        buildProductPayload(),
      );
      await admin.client.delete(`/api/v1/products/${deleted.body.data.product.id}`);

      const ids = [visible, draft, privateProduct, deleted]
        .map((response) => response.body.data.product.id)
        .join(",");

      const anon = new TestHttpClient(server.baseUrl);
      const response = await anon.get<{ data: { products: Array<{ id: string }> } }>(
        `/api/v1/products/bulk?ids=${ids}`,
      );

      expect(response.status).toBe(200);
      expect(response.body.data.products.map((product) => product.id)).toEqual([
        visible.body.data.product.id,
      ]);
    });

    it("rejects a missing ids query parameter", async () => {
      const anon = new TestHttpClient(server.baseUrl);
      const response = await anon.get("/api/v1/products/bulk");
      expect(response.status).toBe(400);
    });

    it("rejects an empty ids query parameter", async () => {
      const anon = new TestHttpClient(server.baseUrl);
      const response = await anon.get("/api/v1/products/bulk?ids=");
      expect(response.status).toBe(400);
    });

    it("rejects ids containing an empty entry", async () => {
      const admin = await registerAndLoginTestUser(server.baseUrl);
      await elevateToAdmin(admin);
      const created = await admin.client.post<{ data: { product: { id: string } } }>(
        "/api/v1/products",
        buildProductPayload(),
      );
      const id = created.body.data.product.id;

      const anon = new TestHttpClient(server.baseUrl);
      const response = await anon.get(`/api/v1/products/bulk?ids=${id},,`);
      expect(response.status).toBe(400);
    });

    it("does not shadow GET /products/:id — an unrelated id-shaped path still 404s normally", async () => {
      // Regression guard for the /bulk-before-/:id route-ordering
      // requirement (see routes/product.routes.ts's doc comment).
      const anon = new TestHttpClient(server.baseUrl);
      const response = await anon.get("/api/v1/products/definitely-not-a-real-id");
      expect(response.status).toBe(404);
    });

    describe("image attachment", () => {
      it("returns the earliest-created ready product_image, and null when none exists", async () => {
        const admin = await registerAndLoginTestUser(server.baseUrl);
        await elevateToAdmin(admin);

        const withImage = await admin.client.post<{ data: { product: { id: string } } }>(
          "/api/v1/products",
          buildProductPayload(),
        );
        const withoutImage = await admin.client.post<{ data: { product: { id: string } } }>(
          "/api/v1/products",
          buildProductPayload(),
        );
        const withImageId = withImage.body.data.product.id;
        const withoutImageId = withoutImage.body.data.product.id;

        // Two product_image assets for the same product, created a
        // moment apart — the earlier one must win, per the documented
        // deterministic rule (see repository/product-image-lookup.repository.prisma.ts).
        const older = await prisma.mediaAsset.create({
          data: {
            fileName: "older.jpg",
            mimeType: "image/jpeg",
            sizeBytes: 100,
            url: "https://example.com/older.jpg",
            provider: "local",
            providerRef: "older-ref",
            purpose: "product_image",
            ownerType: "product",
            ownerId: withImageId,
            altText: "Older image",
            status: "ready",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
          },
        });
        await prisma.mediaAsset.create({
          data: {
            fileName: "newer.jpg",
            mimeType: "image/jpeg",
            sizeBytes: 100,
            url: "https://example.com/newer.jpg",
            provider: "local",
            providerRef: "newer-ref",
            purpose: "product_image",
            ownerType: "product",
            ownerId: withImageId,
            altText: "Newer image",
            status: "ready",
            createdAt: new Date("2026-01-02T00:00:00.000Z"),
          },
        });
        // A non-`ready` asset for the "no image" product — must never be
        // selected.
        await prisma.mediaAsset.create({
          data: {
            fileName: "pending.jpg",
            mimeType: "image/jpeg",
            sizeBytes: 100,
            url: "https://example.com/pending.jpg",
            provider: "local",
            providerRef: "pending-ref",
            purpose: "product_image",
            ownerType: "product",
            ownerId: withoutImageId,
            status: "pending",
          },
        });

        const anon = new TestHttpClient(server.baseUrl);
        const response = await anon.get<{
          data: {
            products: Array<{
              id: string;
              image: { id: string; url: string; altText: string | null } | null;
            }>;
          };
        }>(`/api/v1/products/bulk?ids=${withImageId},${withoutImageId}`);

        expect(response.status).toBe(200);
        const [productWithImage, productWithoutImage] = response.body.data.products;
        expect(productWithImage?.image).toEqual({
          id: older.id,
          url: "https://example.com/older.jpg",
          altText: "Older image",
        });
        expect(productWithoutImage?.image).toBeNull();
      });

      it("resolves images for many products without one query per product", async () => {
        const admin = await registerAndLoginTestUser(server.baseUrl);
        await elevateToAdmin(admin);

        const created = await Promise.all(
          Array.from({ length: 10 }, () =>
            admin.client.post<{ data: { product: { id: string } } }>(
              "/api/v1/products",
              buildProductPayload(),
            ),
          ),
        );
        const ids = created.map((response) => response.body.data.product.id);

        const anon = new TestHttpClient(server.baseUrl);
        const start = Date.now();
        const response = await anon.get<{ data: { products: unknown[] } }>(
          `/api/v1/products/bulk?ids=${ids.join(",")}`,
        );
        const durationMs = Date.now() - start;

        expect(response.status).toBe(200);
        expect(response.body.data.products).toHaveLength(10);
        // Not a strict proof of query count — that's
        // `service/product.service.test.ts`'s job via mocked call-count
        // assertions. This is a generous ceiling that only guards
        // against an accidental N+1 regression making the endpoint
        // scale linearly with request size.
        expect(durationMs).toBeLessThan(2000);
      });
    });
  });
});
