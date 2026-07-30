import { prisma } from "../../../database";
import { NotImplementedError } from "../../../errors";

import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { CartFilterOptions } from "../interfaces";
import type {
  Cart,
  CartItem,
  CreateCartInput,
  CreateCartItemInput,
  UpdateCartInput,
  UpdateCartItemInput,
} from "../types";
import type { CartRepository } from "./cart.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `CartRepository` — currently a
 * skeleton. Every method throws `NotImplementedError` rather than
 * querying `prisma`, because no `Cart`/`CartItem` model exists in
 * `prisma/schema.prisma` yet; adding one is out of scope for this
 * foundation. Defaults to the shared `prisma` client from `database/`
 * (never constructs its own connection) so only the method bodies are
 * left to fill in once those models exist.
 */
export class CartPrismaRepository implements CartRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string): Promise<Cart | null> {
    throw new NotImplementedError(
      `CartPrismaRepository.findById is not implemented yet (id: ${id})`,
    );
  }

  async findByUserId(userId: string): Promise<Cart | null> {
    throw new NotImplementedError(
      `CartPrismaRepository.findByUserId is not implemented yet (userId: ${userId})`,
    );
  }

  async findByGuestToken(guestToken: string): Promise<Cart | null> {
    throw new NotImplementedError(
      `CartPrismaRepository.findByGuestToken is not implemented yet (guestToken: ${guestToken})`,
    );
  }

  async findAll(_query: ParsedQuery, _filters?: CartFilterOptions): Promise<PaginatedResult<Cart>> {
    throw new NotImplementedError("CartPrismaRepository.findAll is not implemented yet");
  }

  async create(_data: CreateCartInput): Promise<Cart> {
    throw new NotImplementedError("CartPrismaRepository.create is not implemented yet");
  }

  async update(id: string, _data: UpdateCartInput): Promise<Cart> {
    throw new NotImplementedError(`CartPrismaRepository.update is not implemented yet (id: ${id})`);
  }

  async delete(id: string): Promise<void> {
    throw new NotImplementedError(`CartPrismaRepository.delete is not implemented yet (id: ${id})`);
  }

  async findItemsByCartId(cartId: string): Promise<CartItem[]> {
    throw new NotImplementedError(
      `CartPrismaRepository.findItemsByCartId is not implemented yet (cartId: ${cartId})`,
    );
  }

  async findItemById(itemId: string): Promise<CartItem | null> {
    throw new NotImplementedError(
      `CartPrismaRepository.findItemById is not implemented yet (itemId: ${itemId})`,
    );
  }

  async addItem(_data: CreateCartItemInput): Promise<CartItem> {
    throw new NotImplementedError("CartPrismaRepository.addItem is not implemented yet");
  }

  async updateItem(itemId: string, _data: UpdateCartItemInput): Promise<CartItem> {
    throw new NotImplementedError(
      `CartPrismaRepository.updateItem is not implemented yet (itemId: ${itemId})`,
    );
  }

  async removeItem(itemId: string): Promise<void> {
    throw new NotImplementedError(
      `CartPrismaRepository.removeItem is not implemented yet (itemId: ${itemId})`,
    );
  }
}
