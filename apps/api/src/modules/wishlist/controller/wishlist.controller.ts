import { HTTP_STATUS, parseQuery, sendPaginatedResponse, sendSuccess } from "../../../common";
import { BadRequestError, UnauthorizedError } from "../../../errors";
import { asyncHandler } from "../../../utils";
import { WISHLIST_ITEM_FILTERABLE_FIELDS, WISHLIST_ITEM_SORTABLE_FIELDS } from "../constants";

import type { AuthenticatedUser } from "../../../auth";
import type { AddWishlistItemDto, UpdateWishlistItemDto } from "../dto";
import type { WishlistService } from "../service";
import type { Request } from "express";

function requireAuthenticatedUser(req: Request): AuthenticatedUser {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }
  return req.user;
}

function requireParam(req: Request, key: string): string {
  const value = req.params[key];
  if (!value) {
    throw new BadRequestError(`"${key}" parameter is required`);
  }
  return value;
}

/**
 * Express handlers for every Wishlist API endpoint. Each method is an
 * `asyncHandler`-wrapped arrow function (bound automatically, so
 * `routes/wishlist.routes.ts` can reference `wishlistController.x`
 * directly) and does only three things: read the request, call one
 * `WishlistService` method, and send the response — no business logic
 * lives here, mirroring every other module's controller.
 *
 * Every endpoint requires `authenticate` at the route layer (never
 * `extractCurrentUser`) — unlike `modules/cart`, this module has no
 * guest path at all, so every handler here can call
 * `requireAuthenticatedUser` unconditionally instead of branching on
 * `req.user`.
 */
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  getWishlist = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const wishlist = await this.wishlistService.getWishlistForUser(actor);
    sendSuccess(res, { wishlist });
  });

  listItems = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const parsed = parseQuery(req.query, {
      sortableFields: WISHLIST_ITEM_SORTABLE_FIELDS,
      filterableFields: WISHLIST_ITEM_FILTERABLE_FIELDS,
    });
    const result = await this.wishlistService.findItems(actor, parsed);
    sendPaginatedResponse(res, result.items, result.meta);
  });

  checkProduct = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const productId = requireParam(req, "productId");
    const exists = await this.wishlistService.hasProduct(actor, productId);
    sendSuccess(res, { productId, exists });
  });

  addItem = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const dto = req.body as AddWishlistItemDto;
    const wishlist = await this.wishlistService.addItem(actor, dto);
    sendSuccess(res, { wishlist }, { statusCode: HTTP_STATUS.CREATED });
  });

  updateItem = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const itemId = requireParam(req, "itemId");
    const dto = req.body as UpdateWishlistItemDto;
    const wishlist = await this.wishlistService.updateItem(actor, itemId, dto);
    sendSuccess(res, { wishlist });
  });

  removeItem = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const itemId = requireParam(req, "itemId");
    const wishlist = await this.wishlistService.removeItem(actor, itemId);
    sendSuccess(res, { wishlist });
  });

  moveItemToCart = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const itemId = requireParam(req, "itemId");
    const result = await this.wishlistService.moveItemToCart(actor, itemId);
    sendSuccess(res, result);
  });
}
