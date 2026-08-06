import { Router } from "express";

import { authenticate, extractCurrentUser } from "../../../auth";
import { validateRequest } from "../../../common";
import { PERMISSIONS, requirePermission } from "../../rbac";
import { CartController } from "../controller";
import { CartPrismaRepository, ProductAvailabilityPrismaRepository } from "../repository";
import { CartService } from "../service";
import {
  addCartItemSchema,
  cartItemParamsSchema,
  createCartSchema,
  updateCartItemSchema,
} from "../validation";

const cartRepository = new CartPrismaRepository();
const productAvailabilityRepository = new ProductAvailabilityPrismaRepository();
const cartService = new CartService(cartRepository, productAvailabilityRepository);
const cartController = new CartController(cartService);

/**
 * The full Cart API surface, mounted at `/api/v1/cart` (see
 * `routes/v1/index.ts`). Every endpoint except `POST /guest` (creating
 * a brand-new guest identity) and the admin listing uses
 * `extractCurrentUser` (never `authenticate`) — a guest shopper without
 * an account must be able to add to and manage a cart, authenticated
 * only by the `x-guest-token` header `CartController` reads (see
 * `constants/cart.constants.ts`'s `CART_GUEST_TOKEN_HEADER`), never a
 * bearer token. `POST /merge` requires `authenticate`: merging only
 * makes sense once a caller has actually logged in. `GET /admin/all`
 * requires `authenticate` + `cart:read` — the only cart capability that
 * isn't self-service (see `modules/rbac`'s `PERMISSIONS.CART_READ` doc
 * comment).
 */
export const cartRouter: Router = Router();

cartRouter.get("/", extractCurrentUser, cartController.getCart);
cartRouter.delete("/", extractCurrentUser, cartController.clearCart);

cartRouter.post(
  "/guest",
  validateRequest({ body: createCartSchema }),
  cartController.createGuestCart,
);

cartRouter.post(
  "/items",
  extractCurrentUser,
  validateRequest({ body: addCartItemSchema }),
  cartController.addItem,
);
cartRouter.patch(
  "/items/:itemId",
  extractCurrentUser,
  validateRequest({ params: cartItemParamsSchema, body: updateCartItemSchema }),
  cartController.updateItem,
);
cartRouter.delete(
  "/items/:itemId",
  extractCurrentUser,
  validateRequest({ params: cartItemParamsSchema }),
  cartController.removeItem,
);

cartRouter.post("/merge", authenticate, cartController.mergeGuestCart);

cartRouter.get(
  "/admin/all",
  authenticate,
  requirePermission(PERMISSIONS.CART_READ),
  cartController.list,
);
