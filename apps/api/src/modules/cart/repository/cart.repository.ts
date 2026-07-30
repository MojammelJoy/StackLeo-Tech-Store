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

/**
 * Persistence contract for the Cart domain entity, plus its items. The
 * service depends on this interface, never on a concrete implementation
 * directly, so swapping `CartPrismaRepository` for a test double (or a
 * different persistence layer entirely) never touches service code.
 * Item operations are folded into this same interface rather than a
 * parallel one, mirroring `modules/inventory`'s movement methods living
 * on `InventoryRepository` — a cart item has no meaningful existence
 * apart from the cart that owns it.
 */
export interface CartRepository {
  findById(id: string): Promise<Cart | null>;
  findByUserId(userId: string): Promise<Cart | null>;
  findByGuestToken(guestToken: string): Promise<Cart | null>;
  findAll(query: ParsedQuery, filters?: CartFilterOptions): Promise<PaginatedResult<Cart>>;
  create(data: CreateCartInput): Promise<Cart>;
  update(id: string, data: UpdateCartInput): Promise<Cart>;
  delete(id: string): Promise<void>;

  findItemsByCartId(cartId: string): Promise<CartItem[]>;
  findItemById(itemId: string): Promise<CartItem | null>;
  addItem(data: CreateCartItemInput): Promise<CartItem>;
  updateItem(itemId: string, data: UpdateCartItemInput): Promise<CartItem>;
  removeItem(itemId: string): Promise<void>;
}
