import { NotImplementedError } from "../../../errors";

import type { AuthenticatedUser } from "../../../auth";
import type { AddCartItemDto, CreateCartDto, UpdateCartItemDto } from "../dto";
import type { CartRepository } from "../repository";
import type { Cart, CartItem, CartSummary } from "../types";

/**
 * Skeleton cart service — the operations a concrete implementation will
 * expose once cart persistence exists. Depends on `CartRepository`
 * (interface only; see `repository/`), never on Prisma directly, so
 * this class never changes when the persistence layer does. Every
 * method throws `NotImplementedError` — no database operations, no
 * price lookups, and no business rules (merge conflict resolution,
 * stock checks on add, etc.) happen in this foundation.
 *
 * Guest vs. authenticated carts are two distinct entry points
 * (`createGuestCart`/`createAuthenticatedCart`,
 * `findByGuestToken`/`findByUserId`) rather than one overloaded method,
 * since the two differ in more than "which ID field is set" — only an
 * authenticated cart survives long-term, and only a guest cart can be
 * merged into one. Item mutations accept an optional `actor` (a guest
 * has none) for a future concrete implementation's audit trail;
 * `createAuthenticatedCart`/`mergeGuestCartIntoUserCart` require one,
 * since both are inherently about a specific user. Nothing here checks
 * `actor`'s permissions; that is `modules/rbac`'s job.
 */
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  async findById(id: string): Promise<Cart | null> {
    throw new NotImplementedError(`CartService.findById is not implemented yet (id: ${id})`);
  }

  async findByUserId(userId: string): Promise<Cart | null> {
    throw new NotImplementedError(
      `CartService.findByUserId is not implemented yet (userId: ${userId})`,
    );
  }

  async findByGuestToken(guestToken: string): Promise<Cart | null> {
    throw new NotImplementedError(
      `CartService.findByGuestToken is not implemented yet (guestToken: ${guestToken})`,
    );
  }

  async createGuestCart(_dto: CreateCartDto): Promise<Cart> {
    throw new NotImplementedError("CartService.createGuestCart is not implemented yet");
  }

  async createAuthenticatedCart(_dto: CreateCartDto, _actor: AuthenticatedUser): Promise<Cart> {
    throw new NotImplementedError("CartService.createAuthenticatedCart is not implemented yet");
  }

  /** Folds a guest cart's items into the same user's authenticated cart after login — creating one first if they don't have one yet. */
  async mergeGuestCartIntoUserCart(guestCartId: string, _actor: AuthenticatedUser): Promise<Cart> {
    throw new NotImplementedError(
      `CartService.mergeGuestCartIntoUserCart is not implemented yet (guestCartId: ${guestCartId})`,
    );
  }

  async addItem(
    cartId: string,
    _dto: AddCartItemDto,
    _actor?: AuthenticatedUser,
  ): Promise<CartItem> {
    throw new NotImplementedError(`CartService.addItem is not implemented yet (cartId: ${cartId})`);
  }

  async updateItem(
    itemId: string,
    _dto: UpdateCartItemDto,
    _actor?: AuthenticatedUser,
  ): Promise<CartItem> {
    throw new NotImplementedError(
      `CartService.updateItem is not implemented yet (itemId: ${itemId})`,
    );
  }

  async removeItem(itemId: string, _actor?: AuthenticatedUser): Promise<void> {
    throw new NotImplementedError(
      `CartService.removeItem is not implemented yet (itemId: ${itemId})`,
    );
  }

  async getSummary(cartId: string): Promise<CartSummary> {
    throw new NotImplementedError(
      `CartService.getSummary is not implemented yet (cartId: ${cartId})`,
    );
  }
}
