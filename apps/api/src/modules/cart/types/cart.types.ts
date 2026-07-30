import type { CartStatus } from "../constants";

/**
 * The persisted Cart domain entity. Not a Prisma-generated type — no
 * `Cart` model exists in `prisma/schema.prisma` yet (out of scope for
 * this foundation). Exactly one of `userId`/`guestToken` is set at any
 * time — never both, never neither — enforced by a future concrete
 * service implementation, not by this type itself.
 */
export interface Cart {
  id: string;
  userId: string | null;
  guestToken: string | null;
  currency: string;
  status: CartStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCartInput {
  userId?: string | null;
  guestToken?: string | null;
  currency?: string;
  status?: CartStatus;
}

/**
 * Deliberately narrow: `userId`/`guestToken`/`currency` are identity/
 * setup fields, not something a general-purpose update mutates — a
 * guest cart becoming an authenticated one happens via
 * `mergeGuestCartIntoUserCart`, not by patching `userId` onto it.
 */
export interface UpdateCartInput {
  status?: CartStatus;
}
