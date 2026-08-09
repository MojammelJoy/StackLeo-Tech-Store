import { elevateToAdmin, registerAndLoginTestUser } from "../testing/integration";
import { randomTestId } from "../testing/utils";

import type { RegisteredTestUser } from "../testing/integration";

/**
 * Shared building blocks every cross-module integration suite under
 * `src/integration/` needs (product+inventory seeding, address
 * creation, cart population, order placement) — pulled out once these
 * started repeating verbatim across `cart-coupon.integration.test.ts`
 * and the order/payment/review/admin/analytics suites that follow it.
 * Every function here drives the real HTTP API, never a repository or
 * service directly — this is fixture *setup* through the same path a
 * real client would use, not a shortcut around it (the one exception,
 * `prisma` direct writes, is reserved for state the API genuinely has
 * no endpoint for, e.g. role elevation — see
 * `testing/integration/auth-flow.ts`).
 */

export interface TestProduct {
  id: string;
  sku: string;
  price: number;
  currency: string;
}

export async function createAdmin(baseUrl: string): Promise<RegisteredTestUser> {
  const admin = await registerAndLoginTestUser(baseUrl);
  await elevateToAdmin(admin);
  return admin;
}

export async function createSellableProduct(
  admin: RegisteredTestUser,
  overrides: Record<string, unknown> = {},
): Promise<TestProduct> {
  const unique = randomTestId("prod");
  const payload = {
    name: `Test Product ${unique}`,
    sku: `SKU-${unique}`,
    price: 2500,
    currency: "USD",
    status: "active",
    visibility: "public",
    ...overrides,
  };
  const created = await admin.client.post<{ data: { product: TestProduct } }>(
    "/api/v1/products",
    payload,
  );
  if (created.status !== 201) {
    throw new Error(`Failed to create test product: ${JSON.stringify(created.body)}`);
  }
  return created.body.data.product;
}

export async function stockProduct(
  admin: RegisteredTestUser,
  sku: string,
  quantity: number,
  warehouseId = "wh-main",
): Promise<string> {
  const response = await admin.client.post<{ data: { item: { id: string } } }>(
    "/api/v1/inventory",
    { sku, warehouseId, quantity },
  );
  if (response.status !== 201) {
    throw new Error(`Failed to stock test product: ${JSON.stringify(response.body)}`);
  }
  return response.body.data.item.id;
}

export async function createAddress(
  user: RegisteredTestUser,
  overrides: Record<string, unknown> = {},
): Promise<{ id: string }> {
  const payload = {
    type: "both",
    recipientName: "Test Recipient",
    phone: "+8801700000000",
    line1: "123 Test Street",
    city: "Dhaka",
    division: "Dhaka",
    postalCode: "1207",
    country: "BD",
    ...overrides,
  };
  const response = await user.client.post<{ data: { address: { id: string } } }>(
    "/api/v1/addresses",
    payload,
  );
  if (response.status !== 201) {
    throw new Error(`Failed to create test address: ${JSON.stringify(response.body)}`);
  }
  return response.body.data.address;
}

export async function addToCart(
  user: RegisteredTestUser,
  product: Pick<TestProduct, "id" | "sku">,
  quantity: number,
): Promise<void> {
  const response = await user.client.post("/api/v1/cart/items", {
    productId: product.id,
    sku: product.sku,
    quantity,
  });
  if (response.status !== 201) {
    throw new Error(`Failed to add item to cart: ${JSON.stringify(response.body)}`);
  }
}

export interface PlacedOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  billingAddressId: string;
  shippingAddressId: string;
  billingAddress: Record<string, unknown>;
  shippingAddress: Record<string, unknown>;
  couponCode: string | null;
  items: Array<{
    id: string;
    productId: string;
    sku: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  summary: { itemCount: number; subtotal: number; total: number; currency: string };
}

/**
 * Places an order via the real `POST /api/v1/orders` endpoint. The
 * caller is expected to have already populated their cart (`addToCart`)
 * and to pass real, owned address ids — this does not build those for
 * you, since different tests need different combinations (shared vs
 * separate billing/shipping, missing address, another user's address).
 */
export async function placeOrder(
  user: RegisteredTestUser,
  body: {
    billingAddressId: string;
    shippingAddressId: string;
    couponCode?: string;
    notes?: string;
  },
): Promise<{ status: number; order: PlacedOrder | null; rawBody: unknown }> {
  const response = await user.client.post<{ data: { order: PlacedOrder } }>("/api/v1/orders", body);
  return {
    status: response.status,
    order: response.status === 201 ? response.body.data.order : null,
    rawBody: response.body,
  };
}

/** End-to-end happy-path setup: an admin-seeded, in-stock product, a
 * buyer with a real address, one unit in the cart, and the placed
 * order — the starting point most order/payment/review tests need. */
export async function setUpAndPlaceOrder(
  baseUrl: string,
  options: { quantity?: number; stock?: number; price?: number } = {},
): Promise<{
  admin: RegisteredTestUser;
  buyer: RegisteredTestUser;
  product: TestProduct;
  address: { id: string };
  order: PlacedOrder;
}> {
  const admin = await createAdmin(baseUrl);
  const product = await createSellableProduct(admin, { price: options.price ?? 2500 });
  await stockProduct(admin, product.sku, options.stock ?? 10);

  const buyer = await registerAndLoginTestUser(baseUrl);
  const address = await createAddress(buyer);
  await addToCart(buyer, product, options.quantity ?? 1);

  const result = await placeOrder(buyer, {
    billingAddressId: address.id,
    shippingAddressId: address.id,
  });
  if (result.status !== 201 || !result.order) {
    throw new Error(`Failed to place fixture order: ${JSON.stringify(result.rawBody)}`);
  }

  return { admin, buyer, product, address, order: result.order };
}
