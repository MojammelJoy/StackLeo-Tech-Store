/**
 * The complete permission vocabulary, `resource:action` by convention.
 * Scoped to `user`/`product`/`category`/`brand`/`inventory`/`media`
 * (the domain modules that exist) and to RBAC's own administration.
 */
export const PERMISSIONS = {
  USER_READ: "user:read",
  USER_CREATE: "user:create",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",
  RBAC_MANAGE: "rbac:manage",
  PRODUCT_READ: "product:read",
  PRODUCT_CREATE: "product:create",
  PRODUCT_UPDATE: "product:update",
  PRODUCT_DELETE: "product:delete",
  CATEGORY_READ: "category:read",
  CATEGORY_CREATE: "category:create",
  CATEGORY_UPDATE: "category:update",
  CATEGORY_DELETE: "category:delete",
  BRAND_READ: "brand:read",
  BRAND_CREATE: "brand:create",
  BRAND_UPDATE: "brand:update",
  BRAND_DELETE: "brand:delete",
  /** Unlike the catalog modules' `*_READ` (which only gates seeing
   * non-public rows — anonymous callers still see the public subset),
   * `INVENTORY_READ` gates *all* inventory access: stock levels and
   * warehouse data are internal/operational, never customer-facing, so
   * there is no anonymous read path for this module at all. */
  INVENTORY_READ: "inventory:read",
  INVENTORY_CREATE: "inventory:create",
  INVENTORY_UPDATE: "inventory:update",
  /** Separate from `INVENTORY_UPDATE`: a manual quantity correction
   * (see `InventoryService.adjustStock`) bypasses the normal stock-flow
   * operations (increase/decrease/reserve/release/transfer) entirely,
   * so it's gated by its own, more sensitive permission rather than
   * folded into general update. */
  INVENTORY_ADJUST: "inventory:adjust",
  /** Like `PRODUCT_READ`/`CATEGORY_READ`/`BRAND_READ`: gates seeing a
   * media asset whose `status` isn't `READY` (pending/failed/deleted) —
   * see `MediaService.canBypassStatusScope`. An anonymous or unprivileged
   * caller still sees every `READY` asset (product images on a public
   * storefront page need no permission at all). */
  MEDIA_READ: "media:read",
  MEDIA_CREATE: "media:create",
  MEDIA_UPDATE: "media:update",
  MEDIA_DELETE: "media:delete",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
