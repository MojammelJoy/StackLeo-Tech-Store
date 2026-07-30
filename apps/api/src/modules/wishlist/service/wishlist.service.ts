import { NotImplementedError } from "../../../errors";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { AddWishlistItemDto, CreateWishlistDto, UpdateWishlistItemDto } from "../dto";
import type { MoveToCartResult } from "../interfaces";
import type { WishlistRepository } from "../repository";
import type { Wishlist, WishlistItem } from "../types";

/**
 * Skeleton wishlist service — the operations a concrete implementation
 * will expose once wishlist persistence exists. Depends on
 * `WishlistRepository` (interface only; see `repository/`), never on
 * Prisma directly, so this class never changes when the persistence
 * layer does. Every method throws `NotImplementedError` — no database
 * operations, no price lookups, and no business rules happen in this
 * foundation.
 *
 * Guest vs. authenticated wishlists are two distinct entry points
 * (`createGuestWishlist`/`createAuthenticatedWishlist`,
 * `findByGuestToken`/`findByUserId`), mirroring `modules/cart`'s
 * `CartService`. `moveItemToCart` deliberately never imports
 * `modules/cart` — it only removes the item from this wishlist and
 * returns it (see `MoveToCartResult` in `interfaces/`); a future
 * concrete implementation (or the caller) is responsible for actually
 * adding it to a cart via `modules/cart`'s own service.
 * `generateShareToken`/`revokeShareToken` are the "wishlist sharing"
 * support this foundation offers — no share link is ever constructed
 * or served here.
 */
export class WishlistService {
  constructor(private readonly wishlistRepository: WishlistRepository) {}

  async findById(id: string): Promise<Wishlist | null> {
    throw new NotImplementedError(`WishlistService.findById is not implemented yet (id: ${id})`);
  }

  async findByUserId(userId: string): Promise<Wishlist | null> {
    throw new NotImplementedError(
      `WishlistService.findByUserId is not implemented yet (userId: ${userId})`,
    );
  }

  async findByGuestToken(guestToken: string): Promise<Wishlist | null> {
    throw new NotImplementedError(
      `WishlistService.findByGuestToken is not implemented yet (guestToken: ${guestToken})`,
    );
  }

  async findByShareToken(shareToken: string): Promise<Wishlist | null> {
    throw new NotImplementedError(
      `WishlistService.findByShareToken is not implemented yet (shareToken: ${shareToken})`,
    );
  }

  async createGuestWishlist(_dto: CreateWishlistDto): Promise<Wishlist> {
    throw new NotImplementedError("WishlistService.createGuestWishlist is not implemented yet");
  }

  async createAuthenticatedWishlist(
    _dto: CreateWishlistDto,
    _actor: AuthenticatedUser,
  ): Promise<Wishlist> {
    throw new NotImplementedError(
      "WishlistService.createAuthenticatedWishlist is not implemented yet",
    );
  }

  async findItems(
    wishlistId: string,
    _query: ParsedQuery,
    _actor?: AuthenticatedUser,
  ): Promise<PaginatedResult<WishlistItem>> {
    throw new NotImplementedError(
      `WishlistService.findItems is not implemented yet (wishlistId: ${wishlistId})`,
    );
  }

  async addItem(
    wishlistId: string,
    _dto: AddWishlistItemDto,
    _actor?: AuthenticatedUser,
  ): Promise<WishlistItem> {
    throw new NotImplementedError(
      `WishlistService.addItem is not implemented yet (wishlistId: ${wishlistId})`,
    );
  }

  async updateItem(
    itemId: string,
    _dto: UpdateWishlistItemDto,
    _actor?: AuthenticatedUser,
  ): Promise<WishlistItem> {
    throw new NotImplementedError(
      `WishlistService.updateItem is not implemented yet (itemId: ${itemId})`,
    );
  }

  async removeItem(itemId: string, _actor?: AuthenticatedUser): Promise<void> {
    throw new NotImplementedError(
      `WishlistService.removeItem is not implemented yet (itemId: ${itemId})`,
    );
  }

  async moveItemToCart(itemId: string, _actor?: AuthenticatedUser): Promise<MoveToCartResult> {
    throw new NotImplementedError(
      `WishlistService.moveItemToCart is not implemented yet (itemId: ${itemId})`,
    );
  }

  async generateShareToken(wishlistId: string, _actor: AuthenticatedUser): Promise<Wishlist> {
    throw new NotImplementedError(
      `WishlistService.generateShareToken is not implemented yet (wishlistId: ${wishlistId})`,
    );
  }

  async revokeShareToken(wishlistId: string, _actor: AuthenticatedUser): Promise<Wishlist> {
    throw new NotImplementedError(
      `WishlistService.revokeShareToken is not implemented yet (wishlistId: ${wishlistId})`,
    );
  }
}
