import { cartResponseSchema } from "@stackleo/validation";

import { clearGuestToken, getGuestToken, setGuestToken } from "../cart/guest-token";

import { apiRequest } from "./client";

import type {
  AddCartItemRequest,
  ApiSuccessResponse,
  Cart,
  CreateGuestCartRequest,
  UpdateCartItemRequest,
} from "@stackleo/types";

function guestTokenHeaders(): HeadersInit | undefined {
  const token = getGuestToken();
  return token ? { "x-guest-token": token } : undefined;
}

function parseCartResponse(data: unknown): Cart {
  return cartResponseSchema.parse(data).cart;
}

/**
 * Resolves the caller's cart: their authenticated cart (get-or-create)
 * if signed in, otherwise their guest cart via the stored `x-guest-token`
 * — sent whenever one exists, regardless of auth state, since the
 * backend always prefers the session when both are present (see
 * apps/api's `CartController.resolveCart`/`getCart`). A guest with no
 * stored token yet has no cart to read (the backend 400s without the
 * header) — callers without one should create a guest cart first.
 */
export async function getCart(signal?: AbortSignal): Promise<Cart> {
  const response = await apiRequest<ApiSuccessResponse<unknown>>("/api/v1/cart", {
    headers: guestTokenHeaders(),
    signal,
  });
  return parseCartResponse(response.data);
}

/** Always creates a brand-new guest cart — never "find or create" (see
 * apps/api's `CartService.createGuestCart`) — and persists the token the
 * server issues so subsequent requests can find it again. */
export async function createGuestCart(input: CreateGuestCartRequest = {}): Promise<Cart> {
  const response = await apiRequest<ApiSuccessResponse<unknown>>("/api/v1/cart/guest", {
    method: "POST",
    body: input,
  });
  const cart = parseCartResponse(response.data);
  if (cart.guestToken) {
    setGuestToken(cart.guestToken);
  }
  return cart;
}

export async function addCartItem(input: AddCartItemRequest): Promise<Cart> {
  const response = await apiRequest<ApiSuccessResponse<unknown>>("/api/v1/cart/items", {
    method: "POST",
    body: input,
    headers: guestTokenHeaders(),
  });
  return parseCartResponse(response.data);
}

export async function updateCartItem(itemId: string, input: UpdateCartItemRequest): Promise<Cart> {
  const response = await apiRequest<ApiSuccessResponse<unknown>>(`/api/v1/cart/items/${itemId}`, {
    method: "PATCH",
    body: input,
    headers: guestTokenHeaders(),
  });
  return parseCartResponse(response.data);
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  const response = await apiRequest<ApiSuccessResponse<unknown>>(`/api/v1/cart/items/${itemId}`, {
    method: "DELETE",
    headers: guestTokenHeaders(),
  });
  return parseCartResponse(response.data);
}

export async function clearCart(): Promise<Cart> {
  const response = await apiRequest<ApiSuccessResponse<unknown>>("/api/v1/cart", {
    method: "DELETE",
    headers: guestTokenHeaders(),
  });
  return parseCartResponse(response.data);
}

/**
 * Folds the guest cart identified by the locally stored token into the
 * caller's authenticated cart. Requires a real session (cookies) — the
 * guest token travels via the same header every other guest request
 * uses (see apps/api's `CartController.mergeGuestCart`), never a body
 * field. Returns `null` without calling the API when there's no stored
 * guest token (nothing to merge). Clears the stored token afterward: a
 * merged cart is never "the" cart for that guest token again.
 */
export async function mergeGuestCart(): Promise<Cart | null> {
  const token = getGuestToken();
  if (!token) {
    return null;
  }

  const response = await apiRequest<ApiSuccessResponse<unknown>>("/api/v1/cart/merge", {
    method: "POST",
    headers: { "x-guest-token": token },
  });
  clearGuestToken();
  return parseCartResponse(response.data);
}
