import { Router } from "express";

import { authenticate } from "../../../auth";
import { validateRequest } from "../../../common";
import { CartPrismaRepository, CartService, ProductAvailabilityPrismaRepository } from "../../cart";
import { WishlistController } from "../controller";
import { ProductLookupPrismaRepository, WishlistPrismaRepository } from "../repository";
import { WishlistService } from "../service";
import {
  addWishlistItemSchema,
  updateWishlistItemSchema,
  wishlistItemParamsSchema,
  wishlistProductParamsSchema,
} from "../validation";

import type { CartItemAdder } from "../interfaces";

const wishlistRepository = new WishlistPrismaRepository();
const productLookupRepository = new ProductLookupPrismaRepository();

/**
 * `WishlistService.moveItemToCart`'s only integration point with
 * `modules/cart` — a real `CartService` instance, constructed here (the
 * composition root) exactly like every other cross-module wiring in
 * this app (see `routes/v1/index.ts`'s doc comment on why each routes
 * file constructs its own repository/service instances rather than
 * sharing them). Adapts `CartService`'s actual add-to-cart flow
 * (get-or-create the caller's cart, then add one unit of the product)
 * down to `CartItemAdder`'s single method — see that interface's doc
 * comment for why `WishlistService` depends on the narrow interface
 * rather than `CartService` directly.
 */
const cartService = new CartService(
  new CartPrismaRepository(),
  new ProductAvailabilityPrismaRepository(),
);
const cartItemAdder: CartItemAdder = {
  async addItemToCart(actor, productId, sku) {
    const cart = await cartService.getOrCreateActiveCartForUser(actor);
    return cartService.addItem(cart.id, { productId, sku, quantity: 1 }, actor);
  },
};

const wishlistService = new WishlistService(
  wishlistRepository,
  productLookupRepository,
  cartItemAdder,
);
const wishlistController = new WishlistController(wishlistService);

/**
 * The full Wishlist API surface, mounted at `/api/v1/wishlist` (see
 * `routes/v1/index.ts`). Every endpoint requires `authenticate` — this
 * module has no guest path (unlike `modules/cart`), per this API's
 * "authenticated users only" requirement; there is no
 * `extractCurrentUser` route anywhere here.
 */
export const wishlistRouter: Router = Router();

wishlistRouter.get("/", authenticate, wishlistController.getWishlist);
wishlistRouter.get("/items", authenticate, wishlistController.listItems);
wishlistRouter.get(
  "/items/check/:productId",
  authenticate,
  validateRequest({ params: wishlistProductParamsSchema }),
  wishlistController.checkProduct,
);

wishlistRouter.post(
  "/items",
  authenticate,
  validateRequest({ body: addWishlistItemSchema }),
  wishlistController.addItem,
);
wishlistRouter.patch(
  "/items/:itemId",
  authenticate,
  validateRequest({ params: wishlistItemParamsSchema, body: updateWishlistItemSchema }),
  wishlistController.updateItem,
);
wishlistRouter.delete(
  "/items/:itemId",
  authenticate,
  validateRequest({ params: wishlistItemParamsSchema }),
  wishlistController.removeItem,
);

wishlistRouter.post(
  "/items/:itemId/move-to-cart",
  authenticate,
  validateRequest({ params: wishlistItemParamsSchema }),
  wishlistController.moveItemToCart,
);
