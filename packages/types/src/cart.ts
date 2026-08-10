export type CartStatus = "active" | "merged" | "abandoned" | "converted";

/**
 * Mirrors apps/api's `CartItemResponseDto` exactly
 * (apps/api/src/modules/cart/dto/cart-item-response.dto.ts). Only
 * `productId`/`sku` identify the product — the cart module deliberately
 * never imports `modules/product`, so there is no name/image/variant
 * info here. `unitPrice`/`lineTotal` are always computed server-side
 * from the product's *current* price, never a value the client supplies
 * or should recompute.
 */
export interface CartItem {
  id: string;
  productId: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  selected: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Mirrors apps/api's `CartSummary` exactly
 * (apps/api/src/modules/cart/types/cart-summary.types.ts). Computed
 * fresh on every response, over `selected` items only — never stored,
 * and never something this app should recompute itself.
 * `discountTotal`/`taxTotal`/`shippingTotal` are always `0` today (no
 * discount/tax/shipping module exists on the backend yet); the fields
 * are kept here because the backend already returns them.
 */
export interface CartSummary {
  itemCount: number;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  shippingTotal: number;
  total: number;
  currency: string;
}

/**
 * Mirrors apps/api's `CartResponseDto` exactly
 * (apps/api/src/modules/cart/dto/cart-response.dto.ts). Exactly one of
 * `userId`/`guestToken` is set at any time — never both, never neither.
 */
export interface Cart {
  id: string;
  userId: string | null;
  guestToken: string | null;
  currency: string;
  status: CartStatus;
  items: CartItem[];
  summary: CartSummary;
  createdAt: string;
  updatedAt: string;
}

/** What every Cart endpoint actually returns under `data` — mirrors
 * `AuthResponse`'s `{ user }` wrapper pattern. */
export interface CartResponse {
  cart: Cart;
}

/** Mirrors apps/api's `addCartItemSchema`-derived `AddCartItemDto` — no
 * `unitPrice` field; the server always prices the item itself. */
export interface AddCartItemRequest {
  productId: string;
  sku: string;
  quantity: number;
}

/** Mirrors apps/api's `updateCartItemSchema`-derived `UpdateCartItemDto`. */
export interface UpdateCartItemRequest {
  quantity?: number;
  selected?: boolean;
}

/** Mirrors apps/api's `createCartSchema`-derived `CreateCartDto`. */
export interface CreateGuestCartRequest {
  currency?: string;
  guestToken?: string;
}
