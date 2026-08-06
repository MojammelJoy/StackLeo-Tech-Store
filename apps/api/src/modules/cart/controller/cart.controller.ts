import { HTTP_STATUS, parseQuery, sendPaginatedResponse, sendSuccess } from "../../../common";
import { BadRequestError, UnauthorizedError } from "../../../errors";
import { asyncHandler } from "../../../utils";
import {
  CART_FILTERABLE_FIELDS,
  CART_GUEST_TOKEN_HEADER,
  CART_SORTABLE_FIELDS,
} from "../constants";

import type { AuthenticatedUser } from "../../../auth";
import type { FilterParams } from "../../../common";
import type { AddCartItemDto, CreateCartDto, UpdateCartItemDto } from "../dto";
import type { CartFilterOptions } from "../interfaces";
import type { CartService } from "../service";
import type { Cart } from "../types";
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

function getGuestToken(req: Request): string | undefined {
  const header = req.header(CART_GUEST_TOKEN_HEADER);
  return header && header.length > 0 ? header : undefined;
}

/**
 * Express handlers for every Cart API endpoint. Each method is an
 * `asyncHandler`-wrapped arrow function (bound automatically, so
 * `routes/cart.routes.ts` can reference `cartController.x` directly)
 * and does only three things: read the request, call one `CartService`
 * method, and send the response — no business logic lives here,
 * mirroring every other module's controller.
 *
 * Every item-mutation endpoint first resolves "which cart" via
 * `resolveCart` — an authenticated caller's cart (get-or-create) or a
 * guest's cart via the `x-guest-token` header (find-only, never
 * auto-created; see `constants/cart.constants.ts`'s
 * `CART_GUEST_TOKEN_HEADER`) — then passes both the resolved `cartId`
 * and `req.user ?? null` into `CartService`, which re-derives and
 * enforces ownership itself. A request with neither an authenticated
 * session nor a guest token is rejected before any service call.
 */
export class CartController {
  constructor(private readonly cartService: CartService) {}

  getCart = asyncHandler(async (req, res) => {
    const cart = req.user
      ? await this.cartService.getCartForUser(req.user)
      : await this.cartService.getCartForGuestToken(this.requireGuestToken(req));
    sendSuccess(res, { cart });
  });

  createGuestCart = asyncHandler(async (req, res) => {
    const dto = req.body as CreateCartDto;
    const cart = await this.cartService.createGuestCart(dto);
    sendSuccess(res, { cart }, { statusCode: HTTP_STATUS.CREATED });
  });

  addItem = asyncHandler(async (req, res) => {
    const resolvedCart = await this.resolveCart(req);
    const dto = req.body as AddCartItemDto;
    const cart = await this.cartService.addItem(resolvedCart.id, dto, req.user ?? null);
    sendSuccess(res, { cart }, { statusCode: HTTP_STATUS.CREATED });
  });

  updateItem = asyncHandler(async (req, res) => {
    const itemId = requireParam(req, "itemId");
    const dto = req.body as UpdateCartItemDto;
    const cart = await this.cartService.updateItem(itemId, dto, req.user ?? null);
    sendSuccess(res, { cart });
  });

  removeItem = asyncHandler(async (req, res) => {
    const itemId = requireParam(req, "itemId");
    const cart = await this.cartService.removeItem(itemId, req.user ?? null);
    sendSuccess(res, { cart });
  });

  clearCart = asyncHandler(async (req, res) => {
    const resolvedCart = await this.resolveCart(req);
    const cart = await this.cartService.clearCart(resolvedCart.id, req.user ?? null);
    sendSuccess(res, { cart });
  });

  mergeGuestCart = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const guestToken = this.requireGuestToken(req);
    const guestCart = await this.cartService.getActiveCartByGuestToken(guestToken);
    const cart = await this.cartService.mergeGuestCartIntoUserCart(guestCart.id, actor);
    sendSuccess(res, { cart });
  });

  list = asyncHandler(async (req, res) => {
    const parsed = parseQuery(req.query, {
      sortableFields: CART_SORTABLE_FIELDS,
      filterableFields: CART_FILTERABLE_FIELDS,
    });
    const filters = this.extractFilterOptions(parsed.filters);
    const result = await this.cartService.listCarts(parsed, filters);
    sendPaginatedResponse(res, result.items, result.meta);
  });

  private async resolveCart(req: Request): Promise<Cart> {
    if (req.user) {
      return this.cartService.getOrCreateActiveCartForUser(req.user);
    }
    return this.cartService.getActiveCartByGuestToken(this.requireGuestToken(req));
  }

  private requireGuestToken(req: Request): string {
    const token = getGuestToken(req);
    if (!token) {
      throw new BadRequestError(
        `Sign in, or provide a guest cart token via the "${CART_GUEST_TOKEN_HEADER}" header`,
      );
    }
    return token;
  }

  private extractFilterOptions(filters: FilterParams): CartFilterOptions {
    const options: CartFilterOptions = {};
    const userId = filters.userId;
    if (userId) {
      options.userId = String(userId.value);
    }
    const status = filters.status;
    if (status) {
      options.status = String(status.value) as CartFilterOptions["status"];
    }
    return options;
  }
}
