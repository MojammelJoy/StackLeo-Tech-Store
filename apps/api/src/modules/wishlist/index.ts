/**
 * The Wishlist API: domain types (wishlist + item), DTOs + Zod
 * validation schemas (built from reusable field-level schemas in
 * `schemas/`), the repository contract plus its Prisma implementation
 * (wishlist/item persistence, plus a `ProductLookupRepository` for
 * read-only product facts — see that interface's doc comment for why),
 * the mapper/utility helpers that support it all, and the controller/
 * routes exposing it at `/api/v1/wishlist`. Authenticated users only —
 * cart/order/payment/checkout concerns are explicitly out of scope.
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
  wishlistItemParamsSchema,
  wishlistProductParamsSchema,
} from "./validation";
export type {
  AddWishlistItemDto,
  CreateWishlistDto,
  MoveToCartResponseDto,
  UpdateWishlistItemDto,
  WishlistItemResponseDto,
  WishlistResponseDto,
} from "./dto";

export type {
  CartItemAdder,
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

export { ProductLookupPrismaRepository, WishlistPrismaRepository } from "./repository";
export type { ProductLookupRepository, ProductSnapshot, WishlistRepository } from "./repository";

export { WishlistService } from "./service";

export { WishlistController } from "./controller";

export { wishlistRouter } from "./routes";
