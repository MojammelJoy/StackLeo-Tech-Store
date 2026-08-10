import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addCartItem,
  clearCart,
  createGuestCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../lib/api/cart";
import { ApiError } from "../lib/api/client";
import { getGuestToken } from "../lib/cart/guest-token";

import type { AddCartItemRequest, Cart, UpdateCartItemRequest } from "@stackleo/types";

export const cartQueryKeys = {
  all: ["cart"] as const,
  detail: () => [...cartQueryKeys.all, "detail"] as const,
};

/**
 * A brand-new guest (no session, no stored guest token yet) has no cart
 * to read — `GET /cart` 400s without a session or an `x-guest-token`
 * (see apps/api's `CartController.requireGuestToken`). That specific,
 * expected case creates a guest cart instead of surfacing an error;
 * anything else (a real network/server failure) propagates normally.
 */
async function resolveCart(signal?: AbortSignal): Promise<Cart> {
  try {
    return await getCart(signal);
  } catch (error) {
    if (error instanceof ApiError && error.status === 400 && !getGuestToken()) {
      return createGuestCart();
    }
    throw error;
  }
}

export function useCart() {
  return useQuery({
    queryKey: cartQueryKeys.detail(),
    queryFn: ({ signal }) => resolveCart(signal),
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AddCartItemRequest) => addCartItem(input),
    onSuccess: (cart) => {
      queryClient.setQueryData(cartQueryKeys.detail(), cart);
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, input }: { itemId: string; input: UpdateCartItemRequest }) =>
      updateCartItem(itemId, input),
    onSuccess: (cart) => {
      queryClient.setQueryData(cartQueryKeys.detail(), cart);
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onSuccess: (cart) => {
      queryClient.setQueryData(cartQueryKeys.detail(), cart);
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => clearCart(),
    onSuccess: (cart) => {
      queryClient.setQueryData(cartQueryKeys.detail(), cart);
    },
  });
}
