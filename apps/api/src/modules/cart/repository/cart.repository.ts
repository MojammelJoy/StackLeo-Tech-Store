import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { CartFilterOptions } from "../interfaces";
import type {
  Cart,
  CartItem,
  CreateCartInput,
  CreateCartItemInput,
  MergeCartItemsParams,
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
 *
 * `findByUserId`/`findByGuestToken` resolve the *active* cart only
 * (`CART_STATUSES.ACTIVE`) — a merged/abandoned/converted cart is no
 * longer "the" cart for that identity, even though its row still exists
 * for history/audit purposes.
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
  /** Bulk variant of `findItemsByCartId` — one query for every item
   * across every cart in `cartIds`, instead of one query per cart. Used
   * by `CartService.listCarts` (the admin paginated listing) so a page
   * of `N` carts costs one extra query, not `N`. */
  findItemsByCartIds(cartIds: string[]): Promise<CartItem[]>;
  findItemById(itemId: string): Promise<CartItem | null>;
  findItemByCartAndProduct(cartId: string, productId: string): Promise<CartItem | null>;
  /** Upserts by `(cartId, productId)` — `data.quantity` is always the
   * FINAL absolute quantity to persist (already summed with whatever
   * existed, if anything) as decided by `CartService`, never a delta;
   * this method's job is only to make that decided write atomic. */
  addItem(data: CreateCartItemInput): Promise<CartItem>;
  updateItem(itemId: string, data: UpdateCartItemInput): Promise<CartItem>;
  removeItem(itemId: string): Promise<void>;
  /** Deletes every item in `cartId` in one statement — what "clear
   * cart" persists. */
  clearItems(cartId: string): Promise<void>;
  /** Atomically upserts every resolved item from `params.items` into
   * `params.targetCartId` and marks `params.guestCartId` as
   * `CART_STATUSES.MERGED`, inside one transaction — the write half of
   * `CartService.mergeGuestCartIntoUserCart`; the service already
   * decided every item's final quantity/price before calling this. */
  mergeItemsIntoCart(params: MergeCartItemsParams): Promise<Cart>;
}
