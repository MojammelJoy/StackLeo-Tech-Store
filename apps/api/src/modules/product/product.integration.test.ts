import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

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
});
