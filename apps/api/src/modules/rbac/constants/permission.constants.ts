/**
 * The complete permission vocabulary, `resource:action` by convention.
 * Scoped to `user`/`product`/`category` (the domain modules that exist)
 * and to RBAC's own administration.
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
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
