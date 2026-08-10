const GUEST_CART_TOKEN_STORAGE_KEY = "stackleo.cart.guestToken";

/**
 * `localStorage` on purpose, not a cookie — the backend's `x-guest-token`
 * is a plain, non-secret identifier the Cart API expects as a request
 * header (see apps/api's `CART_GUEST_TOKEN_HEADER`), unlike the httpOnly
 * `access_token`/`refresh_token` auth cookies this app never reads or
 * stores itself. This module holds only that one guest cart token —
 * nothing auth-related belongs here.
 */
function getStorage(): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    // Some browsers (e.g. Safari private mode under certain settings)
    // throw merely accessing `localStorage`, not only on read/write.
    return null;
  }
}

export function getGuestToken(): string | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }
  try {
    return storage.getItem(GUEST_CART_TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setGuestToken(token: string): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    storage.setItem(GUEST_CART_TOKEN_STORAGE_KEY, token);
  } catch {
    // Best-effort persistence — losing the token just means the next
    // request creates a fresh guest cart, not a crash.
  }
}

/** Called once a guest cart has been merged into an authenticated cart —
 * a merged cart is never "the" cart for that guest token again (see
 * apps/api's `CartService.mergeGuestCartIntoUserCart`), so holding onto
 * the token afterward would only cause confusion. */
export function clearGuestToken(): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }
  try {
    storage.removeItem(GUEST_CART_TOKEN_STORAGE_KEY);
  } catch {
    // See setGuestToken.
  }
}
