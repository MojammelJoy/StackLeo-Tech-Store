import { prisma } from "../../../database";
import { NotImplementedError } from "../../../errors";

import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { WishlistFilterOptions } from "../interfaces";
import type {
  CreateWishlistInput,
  CreateWishlistItemInput,
  UpdateWishlistInput,
  UpdateWishlistItemInput,
  Wishlist,
  WishlistItem,
} from "../types";
import type { WishlistRepository } from "./wishlist.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `WishlistRepository` — currently a
 * skeleton. Every method throws `NotImplementedError` rather than
 * querying `prisma`, because no `Wishlist`/`WishlistItem` model exists
 * in `prisma/schema.prisma` yet; adding one is out of scope for this
 * foundation. Defaults to the shared `prisma` client from `database/`
 * (never constructs its own connection) so only the method bodies are
 * left to fill in once those models exist.
 */
export class WishlistPrismaRepository implements WishlistRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string): Promise<Wishlist | null> {
    throw new NotImplementedError(
      `WishlistPrismaRepository.findById is not implemented yet (id: ${id})`,
    );
  }

  async findByUserId(userId: string): Promise<Wishlist | null> {
    throw new NotImplementedError(
      `WishlistPrismaRepository.findByUserId is not implemented yet (userId: ${userId})`,
    );
  }

  async findByGuestToken(guestToken: string): Promise<Wishlist | null> {
    throw new NotImplementedError(
      `WishlistPrismaRepository.findByGuestToken is not implemented yet (guestToken: ${guestToken})`,
    );
  }

  async findByShareToken(shareToken: string): Promise<Wishlist | null> {
    throw new NotImplementedError(
      `WishlistPrismaRepository.findByShareToken is not implemented yet (shareToken: ${shareToken})`,
    );
  }

  async findAll(
    _query: ParsedQuery,
    _filters?: WishlistFilterOptions,
  ): Promise<PaginatedResult<Wishlist>> {
    throw new NotImplementedError("WishlistPrismaRepository.findAll is not implemented yet");
  }

  async create(_data: CreateWishlistInput): Promise<Wishlist> {
    throw new NotImplementedError("WishlistPrismaRepository.create is not implemented yet");
  }

  async update(id: string, _data: UpdateWishlistInput): Promise<Wishlist> {
    throw new NotImplementedError(
      `WishlistPrismaRepository.update is not implemented yet (id: ${id})`,
    );
  }

  async delete(id: string): Promise<void> {
    throw new NotImplementedError(
      `WishlistPrismaRepository.delete is not implemented yet (id: ${id})`,
    );
  }

  async findItemsByWishlistId(
    wishlistId: string,
    _query: ParsedQuery,
  ): Promise<PaginatedResult<WishlistItem>> {
    throw new NotImplementedError(
      `WishlistPrismaRepository.findItemsByWishlistId is not implemented yet (wishlistId: ${wishlistId})`,
    );
  }

  async findItemById(itemId: string): Promise<WishlistItem | null> {
    throw new NotImplementedError(
      `WishlistPrismaRepository.findItemById is not implemented yet (itemId: ${itemId})`,
    );
  }

  async findItemByProductId(wishlistId: string, productId: string): Promise<WishlistItem | null> {
    throw new NotImplementedError(
      `WishlistPrismaRepository.findItemByProductId is not implemented yet (wishlistId: ${wishlistId}, productId: ${productId})`,
    );
  }

  async addItem(_data: CreateWishlistItemInput): Promise<WishlistItem> {
    throw new NotImplementedError("WishlistPrismaRepository.addItem is not implemented yet");
  }

  async updateItem(itemId: string, _data: UpdateWishlistItemInput): Promise<WishlistItem> {
    throw new NotImplementedError(
      `WishlistPrismaRepository.updateItem is not implemented yet (itemId: ${itemId})`,
    );
  }

  async removeItem(itemId: string): Promise<void> {
    throw new NotImplementedError(
      `WishlistPrismaRepository.removeItem is not implemented yet (itemId: ${itemId})`,
    );
  }
}
