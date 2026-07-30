import { calculateCartSummary } from "../utils";

import type { CartItemResponseDto, CartResponseDto } from "../dto";
import type { CartMapper } from "../interfaces";
import type { Cart, CartItem } from "../types";

function toItemResponseDto(item: CartItem): CartItemResponseDto {
  return {
    id: item.id,
    productId: item.productId,
    sku: item.sku,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.unitPrice * item.quantity,
    selected: item.selected,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function toItemResponseList(items: CartItem[]): CartItemResponseDto[] {
  return items.map(toItemResponseDto);
}

function toCartResponseDto(cart: Cart, items: CartItem[]): CartResponseDto {
  return {
    id: cart.id,
    userId: cart.userId,
    guestToken: cart.guestToken,
    currency: cart.currency,
    status: cart.status,
    items: toItemResponseList(items),
    summary: calculateCartSummary(items, cart.currency),
    createdAt: cart.createdAt,
    updatedAt: cart.updatedAt,
  };
}

/**
 * The only place a `Cart`/`CartItem` is converted to its public response
 * DTO shape — callers map through this instead of building either DTO
 * (or the summary) by hand.
 */
export const cartMapper: CartMapper = { toItemResponseDto, toItemResponseList, toCartResponseDto };
