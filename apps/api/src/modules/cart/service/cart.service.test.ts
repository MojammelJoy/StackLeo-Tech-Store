import { describe, expect, it, vi } from "vitest";

import { createTestAuthenticatedUser } from "../../../testing";
import { CART_ITEM_MAX_QUANTITY, CART_STATUSES } from "../constants";

import { CartService } from "./cart.service";

import type { AuthenticatedUser } from "../../../auth";
import type {
  CartRepository,
  ProductAvailabilityRepository,
  ProductAvailabilitySnapshot,
  ProductVariantAvailabilitySnapshot,
} from "../repository";
import type { Cart, CartItem } from "../types";

function buildCart(overrides: Partial<Cart> = {}): Cart {
  return {
    id: "cart-1",
    userId: null,
    guestToken: null,
    currency: "USD",
    status: CART_STATUSES.ACTIVE,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function buildItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: "item-1",
    cartId: "cart-1",
    productId: "product-1",
    sku: "SKU-1",
    quantity: 1,
    unitPrice: 1000,
    selected: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function buildSnapshot(
  overrides: Partial<ProductAvailabilitySnapshot> = {},
): ProductAvailabilitySnapshot {
  return {
    id: "product-1",
    sku: "SKU-1",
    price: 1000,
    currency: "USD",
    status: "active",
    visibility: "public",
    deletedAt: null,
    ...overrides,
  };
}

function buildVariantSnapshot(
  overrides: Partial<ProductVariantAvailabilitySnapshot> = {},
): ProductVariantAvailabilitySnapshot {
  return {
    id: "variant-1",
    productId: "product-1",
    sku: "VARIANT-SKU-1",
    price: null,
    currency: null,
    isActive: true,
    ...overrides,
  };
}

function buildCartRepository(overrides: Partial<CartRepository> = {}): CartRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByUserId: vi.fn().mockResolvedValue(null),
    findByGuestToken: vi.fn().mockResolvedValue(null),
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findItemsByCartId: vi.fn().mockResolvedValue([]),
    findItemsByCartIds: vi.fn().mockResolvedValue([]),
    findItemById: vi.fn().mockResolvedValue(null),
    findItemByCartAndSku: vi.fn().mockResolvedValue(null),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    clearItems: vi.fn(),
    mergeItemsIntoCart: vi.fn(),
    ...overrides,
  };
}

function buildProductAvailability(
  overrides: Partial<ProductAvailabilityRepository> = {},
): ProductAvailabilityRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findManyByIds: vi.fn().mockResolvedValue(new Map()),
    findVariantBySku: vi.fn().mockResolvedValue(null),
    findManyVariantsBySkus: vi.fn().mockResolvedValue(new Map()),
    getAvailableQuantity: vi.fn().mockResolvedValue(0),
    ...overrides,
  };
}

const ACTOR: AuthenticatedUser = createTestAuthenticatedUser({ id: "user-1" });

describe("CartService", () => {
  describe("addItem", () => {
    it("adds a new item at the product's current price after validating stock", async () => {
      const cart = buildCart({ userId: "user-1" });
      const cartRepository = buildCartRepository({
        findById: vi.fn().mockResolvedValue(cart),
        findItemByCartAndSku: vi.fn().mockResolvedValue(null),
      });
      const productAvailability = buildProductAvailability({
        findById: vi.fn().mockResolvedValue(buildSnapshot({ price: 2500 })),
        getAvailableQuantity: vi.fn().mockResolvedValue(10),
      });
      const service = new CartService(cartRepository, productAvailability);

      await service.addItem("cart-1", { productId: "product-1", sku: "SKU-1", quantity: 2 }, ACTOR);

      expect(cartRepository.addItem).toHaveBeenCalledWith(
        expect.objectContaining({
          cartId: "cart-1",
          productId: "product-1",
          sku: "SKU-1",
          quantity: 2,
          unitPrice: 2500,
        }),
      );
    });

    it("sums the existing quantity with the requested quantity instead of overwriting it", async () => {
      const cart = buildCart({ userId: "user-1" });
      const cartRepository = buildCartRepository({
        findById: vi.fn().mockResolvedValue(cart),
        findItemByCartAndSku: vi.fn().mockResolvedValue(buildItem({ quantity: 3 })),
      });
      const productAvailability = buildProductAvailability({
        findById: vi.fn().mockResolvedValue(buildSnapshot()),
        getAvailableQuantity: vi.fn().mockResolvedValue(20),
      });
      const service = new CartService(cartRepository, productAvailability);

      await service.addItem("cart-1", { productId: "product-1", sku: "SKU-1", quantity: 4 }, ACTOR);

      expect(cartRepository.addItem).toHaveBeenCalledWith(expect.objectContaining({ quantity: 7 }));
    });

    it("rejects when the combined quantity would exceed the per-item maximum", async () => {
      const cart = buildCart({ userId: "user-1" });
      const cartRepository = buildCartRepository({
        findById: vi.fn().mockResolvedValue(cart),
        findItemByCartAndSku: vi
          .fn()
          .mockResolvedValue(buildItem({ quantity: CART_ITEM_MAX_QUANTITY - 1 })),
      });
      const productAvailability = buildProductAvailability();
      const service = new CartService(cartRepository, productAvailability);

      await expect(
        service.addItem("cart-1", { productId: "product-1", sku: "SKU-1", quantity: 5 }, ACTOR),
      ).rejects.toThrow(/cannot exceed/i);
      expect(cartRepository.addItem).not.toHaveBeenCalled();
    });

    it("rejects a product that is not active/public", async () => {
      const cart = buildCart({ userId: "user-1" });
      const cartRepository = buildCartRepository({ findById: vi.fn().mockResolvedValue(cart) });
      const productAvailability = buildProductAvailability({
        findById: vi.fn().mockResolvedValue(buildSnapshot({ status: "draft" })),
      });
      const service = new CartService(cartRepository, productAvailability);

      await expect(
        service.addItem("cart-1", { productId: "product-1", sku: "SKU-1", quantity: 1 }, ACTOR),
      ).rejects.toThrow(/not found or unavailable/i);
    });

    it("rejects when the given sku does not match the product", async () => {
      const cart = buildCart({ userId: "user-1" });
      const cartRepository = buildCartRepository({ findById: vi.fn().mockResolvedValue(cart) });
      const productAvailability = buildProductAvailability({
        findById: vi.fn().mockResolvedValue(buildSnapshot({ sku: "SKU-REAL" })),
      });
      const service = new CartService(cartRepository, productAvailability);

      await expect(
        service.addItem("cart-1", { productId: "product-1", sku: "SKU-WRONG", quantity: 1 }, ACTOR),
      ).rejects.toThrow(/does not match/i);
    });

    it("rejects when there is not enough stock available", async () => {
      const cart = buildCart({ userId: "user-1" });
      const cartRepository = buildCartRepository({ findById: vi.fn().mockResolvedValue(cart) });
      const productAvailability = buildProductAvailability({
        findById: vi.fn().mockResolvedValue(buildSnapshot()),
        getAvailableQuantity: vi.fn().mockResolvedValue(1),
      });
      const service = new CartService(cartRepository, productAvailability);

      await expect(
        service.addItem("cart-1", { productId: "product-1", sku: "SKU-1", quantity: 5 }, ACTOR),
      ).rejects.toThrow(/available/i);
    });
  });

  describe("addItem with a variant sku", () => {
    it("adds an active variant, using the variant's own sku and price", async () => {
      const cart = buildCart({ userId: "user-1" });
      const cartRepository = buildCartRepository({
        findById: vi.fn().mockResolvedValue(cart),
        findItemByCartAndSku: vi.fn().mockResolvedValue(null),
      });
      const productAvailability = buildProductAvailability({
        findById: vi.fn().mockResolvedValue(buildSnapshot({ price: 1000 })),
        findVariantBySku: vi
          .fn()
          .mockResolvedValue(buildVariantSnapshot({ price: 1500, currency: "USD" })),
        getAvailableQuantity: vi.fn().mockResolvedValue(10),
      });
      const service = new CartService(cartRepository, productAvailability);

      await service.addItem(
        "cart-1",
        { productId: "product-1", sku: "VARIANT-SKU-1", quantity: 1 },
        ACTOR,
      );

      expect(cartRepository.findItemByCartAndSku).toHaveBeenCalledWith("cart-1", "VARIANT-SKU-1");
      expect(productAvailability.getAvailableQuantity).toHaveBeenCalledWith("VARIANT-SKU-1");
      expect(cartRepository.addItem).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: "product-1",
          sku: "VARIANT-SKU-1",
          unitPrice: 1500,
        }),
      );
    });

    it("uses the variant's own price when it overrides the base product's", async () => {
      const cart = buildCart({ userId: "user-1" });
      const cartRepository = buildCartRepository({ findById: vi.fn().mockResolvedValue(cart) });
      const productAvailability = buildProductAvailability({
        findById: vi.fn().mockResolvedValue(buildSnapshot({ price: 1000, currency: "USD" })),
        findVariantBySku: vi
          .fn()
          .mockResolvedValue(buildVariantSnapshot({ price: 4200, currency: "USD" })),
        getAvailableQuantity: vi.fn().mockResolvedValue(10),
      });
      const service = new CartService(cartRepository, productAvailability);

      await service.addItem(
        "cart-1",
        { productId: "product-1", sku: "VARIANT-SKU-1", quantity: 1 },
        ACTOR,
      );

      expect(cartRepository.addItem).toHaveBeenCalledWith(
        expect.objectContaining({ unitPrice: 4200 }),
      );
    });

    it("falls back to the base product's price/currency when the variant doesn't override them", async () => {
      const cart = buildCart({ userId: "user-1" });
      const cartRepository = buildCartRepository({ findById: vi.fn().mockResolvedValue(cart) });
      const productAvailability = buildProductAvailability({
        findById: vi.fn().mockResolvedValue(buildSnapshot({ price: 3300, currency: "USD" })),
        findVariantBySku: vi
          .fn()
          .mockResolvedValue(buildVariantSnapshot({ price: null, currency: null })),
        getAvailableQuantity: vi.fn().mockResolvedValue(10),
      });
      const service = new CartService(cartRepository, productAvailability);

      await service.addItem(
        "cart-1",
        { productId: "product-1", sku: "VARIANT-SKU-1", quantity: 1 },
        ACTOR,
      );

      expect(cartRepository.addItem).toHaveBeenCalledWith(
        expect.objectContaining({ unitPrice: 3300 }),
      );
    });

    it("rejects an inactive variant", async () => {
      const cart = buildCart({ userId: "user-1" });
      const cartRepository = buildCartRepository({ findById: vi.fn().mockResolvedValue(cart) });
      const productAvailability = buildProductAvailability({
        findById: vi.fn().mockResolvedValue(buildSnapshot()),
        findVariantBySku: vi.fn().mockResolvedValue(buildVariantSnapshot({ isActive: false })),
      });
      const service = new CartService(cartRepository, productAvailability);

      await expect(
        service.addItem(
          "cart-1",
          { productId: "product-1", sku: "VARIANT-SKU-1", quantity: 1 },
          ACTOR,
        ),
      ).rejects.toThrow(/variant not found or unavailable/i);
      expect(cartRepository.addItem).not.toHaveBeenCalled();
    });

    it("rejects a variant sku that doesn't exist", async () => {
      const cart = buildCart({ userId: "user-1" });
      const cartRepository = buildCartRepository({ findById: vi.fn().mockResolvedValue(cart) });
      const productAvailability = buildProductAvailability({
        findById: vi.fn().mockResolvedValue(buildSnapshot()),
        findVariantBySku: vi.fn().mockResolvedValue(null),
      });
      const service = new CartService(cartRepository, productAvailability);

      await expect(
        service.addItem(
          "cart-1",
          { productId: "product-1", sku: "NO-SUCH-SKU", quantity: 1 },
          ACTOR,
        ),
      ).rejects.toThrow(/does not match/i);
    });

    it("rejects a variant sku that belongs to a different product", async () => {
      const cart = buildCart({ userId: "user-1" });
      const cartRepository = buildCartRepository({ findById: vi.fn().mockResolvedValue(cart) });
      const productAvailability = buildProductAvailability({
        findById: vi.fn().mockResolvedValue(buildSnapshot({ id: "product-1" })),
        findVariantBySku: vi
          .fn()
          .mockResolvedValue(buildVariantSnapshot({ productId: "some-other-product" })),
      });
      const service = new CartService(cartRepository, productAvailability);

      await expect(
        service.addItem(
          "cart-1",
          { productId: "product-1", sku: "VARIANT-SKU-1", quantity: 1 },
          ACTOR,
        ),
      ).rejects.toThrow(/does not match/i);
    });

    it("still requires the parent product to be sellable, even for an active variant", async () => {
      const cart = buildCart({ userId: "user-1" });
      const cartRepository = buildCartRepository({ findById: vi.fn().mockResolvedValue(cart) });
      const productAvailability = buildProductAvailability({
        findById: vi.fn().mockResolvedValue(buildSnapshot({ status: "draft" })),
      });
      const service = new CartService(cartRepository, productAvailability);

      await expect(
        service.addItem(
          "cart-1",
          { productId: "product-1", sku: "VARIANT-SKU-1", quantity: 1 },
          ACTOR,
        ),
      ).rejects.toThrow(/not found or unavailable/i);
      // Never even looks the variant up once the parent product fails.
      expect(productAvailability.findVariantBySku).not.toHaveBeenCalled();
    });

    it("rejects when the resolved variant stock is insufficient", async () => {
      const cart = buildCart({ userId: "user-1" });
      const cartRepository = buildCartRepository({ findById: vi.fn().mockResolvedValue(cart) });
      const productAvailability = buildProductAvailability({
        findById: vi.fn().mockResolvedValue(buildSnapshot()),
        findVariantBySku: vi.fn().mockResolvedValue(buildVariantSnapshot()),
        getAvailableQuantity: vi.fn().mockResolvedValue(2),
      });
      const service = new CartService(cartRepository, productAvailability);

      await expect(
        service.addItem(
          "cart-1",
          { productId: "product-1", sku: "VARIANT-SKU-1", quantity: 5 },
          ACTOR,
        ),
      ).rejects.toThrow(/available/i);
      expect(productAvailability.getAvailableQuantity).toHaveBeenCalledWith("VARIANT-SKU-1");
    });

    it("treats two different variants of the same product as two separate lines", async () => {
      const cart = buildCart({ userId: "user-1" });
      // No existing line for either sku — each add is a brand-new line,
      // keyed by sku via findItemByCartAndSku, never by productId alone.
      const cartRepository = buildCartRepository({
        findById: vi.fn().mockResolvedValue(cart),
        findItemByCartAndSku: vi.fn().mockResolvedValue(null),
      });
      const productAvailability = buildProductAvailability({
        findById: vi.fn().mockResolvedValue(buildSnapshot()),
        findVariantBySku: vi
          .fn()
          .mockImplementation((sku: string) =>
            Promise.resolve(buildVariantSnapshot({ sku, id: sku })),
          ),
        getAvailableQuantity: vi.fn().mockResolvedValue(10),
      });
      const service = new CartService(cartRepository, productAvailability);

      await service.addItem(
        "cart-1",
        { productId: "product-1", sku: "VARIANT-RED", quantity: 1 },
        ACTOR,
      );
      await service.addItem(
        "cart-1",
        { productId: "product-1", sku: "VARIANT-BLUE", quantity: 1 },
        ACTOR,
      );

      expect(cartRepository.findItemByCartAndSku).toHaveBeenNthCalledWith(
        1,
        "cart-1",
        "VARIANT-RED",
      );
      expect(cartRepository.findItemByCartAndSku).toHaveBeenNthCalledWith(
        2,
        "cart-1",
        "VARIANT-BLUE",
      );
      expect(cartRepository.addItem).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ sku: "VARIANT-RED" }),
      );
      expect(cartRepository.addItem).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ sku: "VARIANT-BLUE" }),
      );
    });
  });

  describe("updateItem", () => {
    it("checks stock against the item's own stored sku (base or variant) when changing quantity", async () => {
      const cart = buildCart({ userId: "user-1" });
      const item = buildItem({ sku: "VARIANT-SKU-1" });
      const cartRepository = buildCartRepository({
        findItemById: vi.fn().mockResolvedValue(item),
        findById: vi.fn().mockResolvedValue(cart),
      });
      const productAvailability = buildProductAvailability({
        getAvailableQuantity: vi.fn().mockResolvedValue(10),
      });
      const service = new CartService(cartRepository, productAvailability);

      await service.updateItem("item-1", { quantity: 3 }, ACTOR);

      expect(productAvailability.getAvailableQuantity).toHaveBeenCalledWith("VARIANT-SKU-1");
      expect(cartRepository.updateItem).toHaveBeenCalledWith(
        "item-1",
        expect.objectContaining({ quantity: 3 }),
      );
    });
  });

  describe("cart ownership", () => {
    it("lets an authenticated actor mutate their own cart", async () => {
      const cart = buildCart({ userId: "user-1" });
      const cartRepository = buildCartRepository({
        findItemById: vi.fn().mockResolvedValue(buildItem({ cartId: "cart-1" })),
        findById: vi.fn().mockResolvedValue(cart),
      });
      const service = new CartService(cartRepository, buildProductAvailability());

      await service.removeItem("item-1", ACTOR);

      expect(cartRepository.removeItem).toHaveBeenCalledWith("item-1");
    });

    it("blocks an authenticated actor from mutating a cart they don't own", async () => {
      const cart = buildCart({ userId: "someone-else" });
      const cartRepository = buildCartRepository({
        findItemById: vi.fn().mockResolvedValue(buildItem({ cartId: "cart-1" })),
        findById: vi.fn().mockResolvedValue(cart),
      });
      const service = new CartService(cartRepository, buildProductAvailability());

      await expect(service.removeItem("item-1", ACTOR)).rejects.toThrow(/not found/i);
      expect(cartRepository.removeItem).not.toHaveBeenCalled();
    });

    it("lets a guest mutate a guest-owned cart", async () => {
      const cart = buildCart({ userId: null });
      const cartRepository = buildCartRepository({
        findItemById: vi.fn().mockResolvedValue(buildItem({ cartId: "cart-1" })),
        findById: vi.fn().mockResolvedValue(cart),
      });
      const service = new CartService(cartRepository, buildProductAvailability());

      await service.removeItem("item-1", null);

      expect(cartRepository.removeItem).toHaveBeenCalledWith("item-1");
    });

    it("blocks a guest from mutating an authenticated user's cart", async () => {
      const cart = buildCart({ userId: "user-1" });
      const cartRepository = buildCartRepository({
        findItemById: vi.fn().mockResolvedValue(buildItem({ cartId: "cart-1" })),
        findById: vi.fn().mockResolvedValue(cart),
      });
      const service = new CartService(cartRepository, buildProductAvailability());

      await expect(service.removeItem("item-1", null)).rejects.toThrow(/not found/i);
      expect(cartRepository.removeItem).not.toHaveBeenCalled();
    });
  });

  describe("getOrCreateActiveCartForUser", () => {
    it("returns the existing active cart without creating a new one", async () => {
      const cart = buildCart({ userId: "user-1" });
      const cartRepository = buildCartRepository({ findByUserId: vi.fn().mockResolvedValue(cart) });
      const service = new CartService(cartRepository, buildProductAvailability());

      const result = await service.getOrCreateActiveCartForUser(ACTOR);

      expect(result).toEqual(cart);
      expect(cartRepository.create).not.toHaveBeenCalled();
    });

    it("creates a new cart when the user has none yet", async () => {
      const created = buildCart({ userId: "user-1" });
      const cartRepository = buildCartRepository({
        findByUserId: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(created),
      });
      const service = new CartService(cartRepository, buildProductAvailability());

      const result = await service.getOrCreateActiveCartForUser(ACTOR);

      expect(cartRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "user-1", status: CART_STATUSES.ACTIVE }),
      );
      expect(result).toEqual(created);
    });
  });

  describe("current-price totals", () => {
    it("prices the cart summary from the product's current price, not the stored snapshot", async () => {
      const cart = buildCart({ userId: "user-1" });
      const staleItem = buildItem({ productId: "product-1", quantity: 2, unitPrice: 1000 });
      const cartRepository = buildCartRepository({
        findByUserId: vi.fn().mockResolvedValue(cart),
        findItemsByCartId: vi.fn().mockResolvedValue([staleItem]),
      });
      const productAvailability = buildProductAvailability({
        findManyByIds: vi
          .fn()
          .mockResolvedValue(new Map([["product-1", buildSnapshot({ price: 5000 })]])),
      });
      const service = new CartService(cartRepository, productAvailability);

      const response = await service.getCartForUser(ACTOR);

      expect(response.items[0]?.unitPrice).toBe(5000);
      expect(response.summary.subtotal).toBe(10000);
    });

    it("prices a variant line from the variant's current price, not the base product's", async () => {
      const cart = buildCart({ userId: "user-1" });
      const variantItem = buildItem({
        productId: "product-1",
        sku: "VARIANT-SKU-1",
        quantity: 1,
        unitPrice: 1000,
      });
      const cartRepository = buildCartRepository({
        findByUserId: vi.fn().mockResolvedValue(cart),
        findItemsByCartId: vi.fn().mockResolvedValue([variantItem]),
      });
      const productAvailability = buildProductAvailability({
        findManyByIds: vi
          .fn()
          .mockResolvedValue(new Map([["product-1", buildSnapshot({ price: 2000 })]])),
        findManyVariantsBySkus: vi
          .fn()
          .mockResolvedValue(new Map([["VARIANT-SKU-1", buildVariantSnapshot({ price: 6000 })]])),
      });
      const service = new CartService(cartRepository, productAvailability);

      const response = await service.getCartForUser(ACTOR);

      expect(response.items[0]?.unitPrice).toBe(6000);
      expect(productAvailability.findManyVariantsBySkus).toHaveBeenCalledWith(["VARIANT-SKU-1"]);
    });

    it("falls back to the base product's live price for a variant line with no price override", async () => {
      const cart = buildCart({ userId: "user-1" });
      const variantItem = buildItem({
        productId: "product-1",
        sku: "VARIANT-SKU-1",
        quantity: 1,
        unitPrice: 999,
      });
      const cartRepository = buildCartRepository({
        findByUserId: vi.fn().mockResolvedValue(cart),
        findItemsByCartId: vi.fn().mockResolvedValue([variantItem]),
      });
      const productAvailability = buildProductAvailability({
        findManyByIds: vi
          .fn()
          .mockResolvedValue(new Map([["product-1", buildSnapshot({ price: 4400 })]])),
        findManyVariantsBySkus: vi
          .fn()
          .mockResolvedValue(new Map([["VARIANT-SKU-1", buildVariantSnapshot({ price: null })]])),
      });
      const service = new CartService(cartRepository, productAvailability);

      const response = await service.getCartForUser(ACTOR);

      expect(response.items[0]?.unitPrice).toBe(4400);
    });
  });

  describe("mergeGuestCartIntoUserCart", () => {
    it("sums quantities with the target cart and writes the merge atomically", async () => {
      const guestCart = buildCart({ id: "guest-cart", userId: null });
      const targetCart = buildCart({ id: "user-cart", userId: "user-1" });
      const guestItem = buildItem({ cartId: "guest-cart", productId: "product-1", quantity: 2 });
      const targetItem = buildItem({ cartId: "user-cart", productId: "product-1", quantity: 1 });

      const cartRepository = buildCartRepository({
        findById: vi.fn().mockResolvedValue(guestCart),
        findByUserId: vi.fn().mockResolvedValue(targetCart),
        findItemsByCartId: vi
          .fn()
          .mockImplementation((cartId: string) =>
            Promise.resolve(cartId === "guest-cart" ? [guestItem] : [targetItem]),
          ),
        mergeItemsIntoCart: vi.fn().mockResolvedValue(targetCart),
      });
      const productAvailability = buildProductAvailability({
        findManyByIds: vi.fn().mockResolvedValue(new Map([["product-1", buildSnapshot()]])),
        getAvailableQuantity: vi.fn().mockResolvedValue(50),
      });
      const service = new CartService(cartRepository, productAvailability);

      await service.mergeGuestCartIntoUserCart("guest-cart", ACTOR);

      expect(cartRepository.mergeItemsIntoCart).toHaveBeenCalledWith({
        guestCartId: "guest-cart",
        targetCartId: "user-cart",
        items: [{ productId: "product-1", sku: "SKU-1", quantity: 3, unitPrice: 1000 }],
      });
    });

    it("merges a guest variant line at the variant's own price, into its own target line", async () => {
      const guestCart = buildCart({ id: "guest-cart", userId: null });
      const targetCart = buildCart({ id: "user-cart", userId: "user-1" });
      const guestVariantItem = buildItem({
        cartId: "guest-cart",
        productId: "product-1",
        sku: "VARIANT-SKU-1",
        quantity: 2,
      });

      const cartRepository = buildCartRepository({
        findById: vi.fn().mockResolvedValue(guestCart),
        findByUserId: vi.fn().mockResolvedValue(targetCart),
        findItemsByCartId: vi
          .fn()
          .mockImplementation((cartId: string) =>
            Promise.resolve(cartId === "guest-cart" ? [guestVariantItem] : []),
          ),
        mergeItemsIntoCart: vi.fn().mockResolvedValue(targetCart),
      });
      const productAvailability = buildProductAvailability({
        findManyByIds: vi.fn().mockResolvedValue(new Map([["product-1", buildSnapshot()]])),
        findManyVariantsBySkus: vi
          .fn()
          .mockResolvedValue(new Map([["VARIANT-SKU-1", buildVariantSnapshot({ price: 2200 })]])),
        getAvailableQuantity: vi.fn().mockResolvedValue(50),
      });
      const service = new CartService(cartRepository, productAvailability);

      await service.mergeGuestCartIntoUserCart("guest-cart", ACTOR);

      expect(cartRepository.mergeItemsIntoCart).toHaveBeenCalledWith({
        guestCartId: "guest-cart",
        targetCartId: "user-cart",
        items: [{ productId: "product-1", sku: "VARIANT-SKU-1", quantity: 2, unitPrice: 2200 }],
      });
    });

    it("drops a guest variant line whose variant has since been deactivated", async () => {
      const guestCart = buildCart({ id: "guest-cart", userId: null });
      const targetCart = buildCart({ id: "user-cart", userId: "user-1" });
      const guestVariantItem = buildItem({
        cartId: "guest-cart",
        productId: "product-1",
        sku: "VARIANT-SKU-1",
        quantity: 1,
      });

      const cartRepository = buildCartRepository({
        findById: vi.fn().mockResolvedValue(guestCart),
        findByUserId: vi.fn().mockResolvedValue(targetCart),
        findItemsByCartId: vi
          .fn()
          .mockImplementation((cartId: string) =>
            Promise.resolve(cartId === "guest-cart" ? [guestVariantItem] : []),
          ),
        mergeItemsIntoCart: vi.fn().mockResolvedValue(targetCart),
      });
      const productAvailability = buildProductAvailability({
        findManyByIds: vi.fn().mockResolvedValue(new Map([["product-1", buildSnapshot()]])),
        findManyVariantsBySkus: vi
          .fn()
          .mockResolvedValue(
            new Map([["VARIANT-SKU-1", buildVariantSnapshot({ isActive: false })]]),
          ),
      });
      const service = new CartService(cartRepository, productAvailability);

      await service.mergeGuestCartIntoUserCart("guest-cart", ACTOR);

      expect(cartRepository.mergeItemsIntoCart).toHaveBeenCalledWith(
        expect.objectContaining({ items: [] }),
      );
    });

    it("refuses to merge a cart that is not an active guest cart", async () => {
      const alreadyMerged = buildCart({
        id: "guest-cart",
        userId: null,
        status: CART_STATUSES.MERGED,
      });
      const cartRepository = buildCartRepository({
        findById: vi.fn().mockResolvedValue(alreadyMerged),
      });
      const service = new CartService(cartRepository, buildProductAvailability());

      await expect(service.mergeGuestCartIntoUserCart("guest-cart", ACTOR)).rejects.toThrow(
        /not an active guest cart/i,
      );
      expect(cartRepository.mergeItemsIntoCart).not.toHaveBeenCalled();
    });
  });
});
