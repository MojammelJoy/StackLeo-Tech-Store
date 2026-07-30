/**
 * The complete role vocabulary. A generic three-tier hierarchy — no
 * business domain (products, orders, etc.) exists yet to justify
 * anything more specific than this.
 */
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  MEMBER: "member",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
