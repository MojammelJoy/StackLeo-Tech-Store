/**
 * The complete permission vocabulary, `resource:action` by convention.
 * Scoped to `user` (the one domain module that exists) and to RBAC's own
 * administration — not to any business domain that hasn't been built.
 */
export const PERMISSIONS = {
  USER_READ: "user:read",
  USER_CREATE: "user:create",
  USER_UPDATE: "user:update",
  USER_DELETE: "user:delete",
  RBAC_MANAGE: "rbac:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
