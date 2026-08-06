import { describe, expect, it, vi } from "vitest";

import { createTestAuthenticatedUser } from "../../../testing";
import { WISHLIST_STATUSES } from "../constants";

import { WishlistService } from "./wishlist.service";

import type { AuthenticatedUser } from "../../../auth";
import type { CartItemAdder } from "../interfaces";
import type { ProductLookupRepository, ProductSnapshot, WishlistRepository } from "../repository";
import type { Wishlist, WishlistItem } from "../types";

function buildWishlist(overrides: Partial<Wishlist> = {}): Wishlist {
  return {
    id: "wishlist-1",
    userId: "user-1",
    guestToken: null,
    visibility: "private",
    shareToken: null,
    status: WISHLIST_STATUSES.ACTIVE,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function buildItem(overrides: Partial<WishlistItem> = {}): WishlistItem {
  return {
    id: "item-1",
    wishlistId: "wishlist-1",
    productId: "product-1",
    sku: "SKU-1",
    priceAtAdd: 1000,
    notifyOnAvailability: false,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function buildSnapshot(overrides: Partial<ProductSnapshot> = {}): ProductSnapshot {
  return {
    id: "product-1",
    sku: "SKU-1",
    price: 1000,
    status: "active",
    visibility: "public",
    deletedAt: null,
    ...overrides,
  };
}

function buildWishlistRepository(overrides: Partial<WishlistRepository> = {}): WishlistRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findByUserId: vi.fn().mockResolvedValue(null),
    findByGuestToken: vi.fn().mockResolvedValue(null),
    findByShareToken: vi.fn().mockResolvedValue(null),
    findAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findOrCreateActiveByUserId: vi.fn(),
    findItemsByWishlistId: vi.fn(),
    findAllItemsByWishlistId: vi.fn().mockResolvedValue([]),
    findItemById: vi.fn().mockResolvedValue(null),
    findItemByProductId: vi.fn().mockResolvedValue(null),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    ...overrides,
  };
}

function buildProductLookup(
  overrides: Partial<ProductLookupRepository> = {},
): ProductLookupRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    ...overrides,
  };
}

function buildCartItemAdder(overrides: Partial<CartItemAdder> = {}): CartItemAdder {
  return {
    addItemToCart: vi.fn(),
    ...overrides,
  };
}

const ACTOR: AuthenticatedUser = createTestAuthenticatedUser({ id: "user-1" });

describe("WishlistService", () => {
  describe("addItem", () => {
    it("adds a new item snapshotting the product's current price", async () => {
      const wishlist = buildWishlist();
      const wishlistRepository = buildWishlistRepository({
        findOrCreateActiveByUserId: vi.fn().mockResolvedValue(wishlist),
        findItemByProductId: vi.fn().mockResolvedValue(null),
      });
      const productLookup = buildProductLookup({
        findById: vi.fn().mockResolvedValue(buildSnapshot({ price: 4200 })),
      });
      const service = new WishlistService(wishlistRepository, productLookup, buildCartItemAdder());

      await service.addItem(ACTOR, {
        productId: "product-1",
        sku: "SKU-1",
        notifyOnAvailability: true,
      });

      expect(wishlistRepository.addItem).toHaveBeenCalledWith({
        wishlistId: "wishlist-1",
        productId: "product-1",
        sku: "SKU-1",
        priceAtAdd: 4200,
        notifyOnAvailability: true,
      });
    });

    it("rejects a product that already exists in the wishlist", async () => {
      const wishlist = buildWishlist();
      const wishlistRepository = buildWishlistRepository({
        findOrCreateActiveByUserId: vi.fn().mockResolvedValue(wishlist),
        findItemByProductId: vi.fn().mockResolvedValue(buildItem()),
      });
      const service = new WishlistService(
        wishlistRepository,
        buildProductLookup(),
        buildCartItemAdder(),
      );

      await expect(
        service.addItem(ACTOR, {
          productId: "product-1",
          sku: "SKU-1",
          notifyOnAvailability: false,
        }),
      ).rejects.toThrow(/already exists/i);
      expect(wishlistRepository.addItem).not.toHaveBeenCalled();
    });

    it("rejects a product that is not active/public", async () => {
      const wishlist = buildWishlist();
      const wishlistRepository = buildWishlistRepository({
        findOrCreateActiveByUserId: vi.fn().mockResolvedValue(wishlist),
      });
      const productLookup = buildProductLookup({
        findById: vi.fn().mockResolvedValue(buildSnapshot({ visibility: "private" })),
      });
      const service = new WishlistService(wishlistRepository, productLookup, buildCartItemAdder());

      await expect(
        service.addItem(ACTOR, {
          productId: "product-1",
          sku: "SKU-1",
          notifyOnAvailability: false,
        }),
      ).rejects.toThrow(/not found or unavailable/i);
    });

    it("rejects when the given sku does not match the product", async () => {
      const wishlist = buildWishlist();
      const wishlistRepository = buildWishlistRepository({
        findOrCreateActiveByUserId: vi.fn().mockResolvedValue(wishlist),
      });
      const productLookup = buildProductLookup({
        findById: vi.fn().mockResolvedValue(buildSnapshot({ sku: "SKU-REAL" })),
      });
      const service = new WishlistService(wishlistRepository, productLookup, buildCartItemAdder());

      await expect(
        service.addItem(ACTOR, {
          productId: "product-1",
          sku: "SKU-WRONG",
          notifyOnAvailability: false,
        }),
      ).rejects.toThrow(/does not match/i);
    });
  });

  describe("hasProduct", () => {
    it("returns false without creating a wishlist when the user has none", async () => {
      const wishlistRepository = buildWishlistRepository({
        findByUserId: vi.fn().mockResolvedValue(null),
      });
      const service = new WishlistService(
        wishlistRepository,
        buildProductLookup(),
        buildCartItemAdder(),
      );

      const result = await service.hasProduct(ACTOR, "product-1");

      expect(result).toBe(false);
      expect(wishlistRepository.findOrCreateActiveByUserId).not.toHaveBeenCalled();
    });

    it("returns true when the product is already on the wishlist", async () => {
      const wishlist = buildWishlist();
      const wishlistRepository = buildWishlistRepository({
        findByUserId: vi.fn().mockResolvedValue(wishlist),
        findItemByProductId: vi.fn().mockResolvedValue(buildItem()),
      });
      const service = new WishlistService(
        wishlistRepository,
        buildProductLookup(),
        buildCartItemAdder(),
      );

      const result = await service.hasProduct(ACTOR, "product-1");

      expect(result).toBe(true);
    });
  });

  describe("wishlist ownership", () => {
    it("blocks removing an item from a wishlist the actor doesn't own", async () => {
      const foreignWishlist = buildWishlist({ userId: "someone-else" });
      const wishlistRepository = buildWishlistRepository({
        findItemById: vi.fn().mockResolvedValue(buildItem()),
        findById: vi.fn().mockResolvedValue(foreignWishlist),
      });
      const service = new WishlistService(
        wishlistRepository,
        buildProductLookup(),
        buildCartItemAdder(),
      );

      await expect(service.removeItem(ACTOR, "item-1")).rejects.toThrow(/not found/i);
      expect(wishlistRepository.removeItem).not.toHaveBeenCalled();
    });

    it("lets the owning actor remove their own item", async () => {
      const wishlist = buildWishlist({ userId: "user-1" });
      const wishlistRepository = buildWishlistRepository({
        findItemById: vi.fn().mockResolvedValue(buildItem()),
        findById: vi.fn().mockResolvedValue(wishlist),
      });
      const service = new WishlistService(
        wishlistRepository,
        buildProductLookup(),
        buildCartItemAdder(),
      );

      await service.removeItem(ACTOR, "item-1");

      expect(wishlistRepository.removeItem).toHaveBeenCalledWith("item-1");
    });
  });

  describe("moveItemToCart", () => {
    it("adds the item to the cart, then removes it from the wishlist", async () => {
      const wishlist = buildWishlist();
      const item = buildItem();
      const wishlistRepository = buildWishlistRepository({
        findItemById: vi.fn().mockResolvedValue(item),
        findById: vi.fn().mockResolvedValue(wishlist),
      });
      const fakeCartResponse = { id: "cart-1", items: [] } as unknown as Awaited<
        ReturnType<CartItemAdder["addItemToCart"]>
      >;
      const cartItemAdder = buildCartItemAdder({
        addItemToCart: vi.fn().mockResolvedValue(fakeCartResponse),
      });
      const service = new WishlistService(wishlistRepository, buildProductLookup(), cartItemAdder);

      const result = await service.moveItemToCart(ACTOR, "item-1");

      expect(cartItemAdder.addItemToCart).toHaveBeenCalledWith(ACTOR, "product-1", "SKU-1");
      expect(wishlistRepository.removeItem).toHaveBeenCalledWith("item-1");
      expect(result.cart).toBe(fakeCartResponse);
    });

    it("does not remove the wishlist item when adding to the cart fails", async () => {
      const wishlist = buildWishlist();
      const item = buildItem();
      const wishlistRepository = buildWishlistRepository({
        findItemById: vi.fn().mockResolvedValue(item),
        findById: vi.fn().mockResolvedValue(wishlist),
      });
      const cartItemAdder = buildCartItemAdder({
        addItemToCart: vi.fn().mockRejectedValue(new Error("cart add failed")),
      });
      const service = new WishlistService(wishlistRepository, buildProductLookup(), cartItemAdder);

      await expect(service.moveItemToCart(ACTOR, "item-1")).rejects.toThrow(/cart add failed/);
      expect(wishlistRepository.removeItem).not.toHaveBeenCalled();
    });
  });
});
