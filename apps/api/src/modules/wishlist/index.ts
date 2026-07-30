/**
 * Reusable wishlist infrastructure: domain types (wishlist + item),
 * DTOs + Zod validation schemas (built from reusable field-level
 * schemas in `schemas/`), the repository contract (plus its currently-
 * skeletal Prisma implementation), a skeleton service, and the mapper/
 * utility helpers that support it all. No controllers, routes, CRUD
 * implementation, or business logic (cart/order/payment concerns) live
 * here.
 */
export {
  WISHLIST_FILTERABLE_FIELDS,
  WISHLIST_ITEM_FILTERABLE_FIELDS,
  WISHLIST_ITEM_SORTABLE_FIELDS,
  WISHLIST_SKU_MAX_LENGTH,
  WISHLIST_SORTABLE_FIELDS,
  WISHLIST_STATUSES,
  WISHLIST_VISIBILITIES,
} from "./constants";
export type { WishlistStatus, WishlistVisibility } from "./constants";

export type {
  CreateWishlistInput,
  CreateWishlistItemInput,
  UpdateWishlistInput,
  UpdateWishlistItemInput,
  Wishlist,
  WishlistItem,
} from "./types";

export { guestTokenSchema, skuSchema } from "./schemas";

export {
  addWishlistItemSchema,
  createWishlistSchema,
  updateWishlistItemSchema,
} from "./validation";
export type {
  AddWishlistItemDto,
  CreateWishlistDto,
  UpdateWishlistItemDto,
  WishlistItemResponseDto,
  WishlistResponseDto,
} from "./dto";

export type {
  MoveToCartResult,
  ProductReference,
  WishlistFilterOptions,
  WishlistMapper,
} from "./interfaces";

export {
  findItemByProduct,
  filterItemsNeedingNotification,
  getGuestWishlistExpiryDays,
  getPriceDifference,
  hasPriceDropped,
  hasProduct,
} from "./utils";

export { wishlistMapper } from "./mapper";

export { WishlistPrismaRepository } from "./repository";
export type { WishlistRepository } from "./repository";

export { WishlistService } from "./service";
