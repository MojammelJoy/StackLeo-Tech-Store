import { PERMISSIONS, ROLES } from "../constants";

import type { Permission } from "../constants";
import type { RolePermissionMap } from "../types";

/**
 * The static role → permission mapping. `SUPER_ADMIN` lists every
 * permission explicitly rather than deriving it from `PERMISSIONS`
 * automatically — an explicit list is what actually gets audited when a
 * new permission is added, instead of silently inheriting it.
 */
export const ROLE_PERMISSIONS: RolePermissionMap = {
  [ROLES.SUPER_ADMIN]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.RBAC_MANAGE,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.CATEGORY_READ,
    PERMISSIONS.CATEGORY_CREATE,
    PERMISSIONS.CATEGORY_UPDATE,
    PERMISSIONS.CATEGORY_DELETE,
    PERMISSIONS.BRAND_READ,
    PERMISSIONS.BRAND_CREATE,
    PERMISSIONS.BRAND_UPDATE,
    PERMISSIONS.BRAND_DELETE,
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.INVENTORY_CREATE,
    PERMISSIONS.INVENTORY_UPDATE,
    PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.MEDIA_READ,
    PERMISSIONS.MEDIA_CREATE,
    PERMISSIONS.MEDIA_UPDATE,
    PERMISSIONS.MEDIA_DELETE,
    PERMISSIONS.CART_READ,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.COUPON_READ,
    PERMISSIONS.COUPON_CREATE,
    PERMISSIONS.COUPON_UPDATE,
    PERMISSIONS.COUPON_DELETE,
    PERMISSIONS.REVIEW_MODERATE,
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_UPDATE,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.CATEGORY_READ,
    PERMISSIONS.CATEGORY_CREATE,
    PERMISSIONS.CATEGORY_UPDATE,
    PERMISSIONS.CATEGORY_DELETE,
    PERMISSIONS.BRAND_READ,
    PERMISSIONS.BRAND_CREATE,
    PERMISSIONS.BRAND_UPDATE,
    PERMISSIONS.BRAND_DELETE,
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.INVENTORY_CREATE,
    PERMISSIONS.INVENTORY_UPDATE,
    PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.MEDIA_READ,
    PERMISSIONS.MEDIA_CREATE,
    PERMISSIONS.MEDIA_UPDATE,
    PERMISSIONS.MEDIA_DELETE,
    PERMISSIONS.CART_READ,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.COUPON_READ,
    PERMISSIONS.COUPON_CREATE,
    PERMISSIONS.COUPON_UPDATE,
    PERMISSIONS.COUPON_DELETE,
    PERMISSIONS.REVIEW_MODERATE,
  ],
  // `PRODUCT_READ`/`CATEGORY_READ`/`BRAND_READ`/`MEDIA_READ` are
  // deliberately absent here: each gates seeing its module's non-
  // `ACTIVE`/non-`PUBLIC`/non-`READY`/soft-deleted rows (see
  // `ProductService`/`CategoryService`/`BrandService`/`MediaService`'s
  // `canBypass*Scope`), a staff-only capability. A member's catalog/
  // media visibility is otherwise identical to an anonymous visitor's
  // — browsing public products, categories, brands, and ready media
  // needs no permission at all. `INVENTORY_*` is absent entirely:
  // unlike those modules, inventory has no public-facing subset at all
  // (see `PERMISSIONS.INVENTORY_READ`'s doc comment) — a member has no
  // inventory access whatsoever, the same as an anonymous caller.
  [ROLES.MEMBER]: [PERMISSIONS.USER_READ],
};

/**
 * Resolves a single role's permissions. Returns `[]` for a role absent
 * from the map (e.g. a stale value from an old token) instead of
 * `undefined`, so callers never need an extra guard.
 */
export function getRolePermissions(role: string): readonly Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
