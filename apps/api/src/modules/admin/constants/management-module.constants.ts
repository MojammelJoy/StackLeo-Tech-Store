/**
 * The 15 areas an admin panel built on this app exposes. `Admin` never
 * imports `modules/user`, `modules/product`, `modules/order`, etc. to
 * define this — it's a flat catalog of bare string keys, the same
 * cross-module decoupling every foundation in this app follows. See
 * `utils/management-module-catalog.util.ts` for the human-readable
 * descriptor built from these keys, and `permissions/` for how each
 * maps to permission keys.
 */
export const MANAGEMENT_MODULES = {
  DASHBOARD: "dashboard",
  USER: "user",
  PRODUCT: "product",
  CATEGORY: "category",
  BRAND: "brand",
  INVENTORY: "inventory",
  ORDER: "order",
  PAYMENT: "payment",
  COUPON: "coupon",
  REVIEW: "review",
  NOTIFICATION: "notification",
  ROLE_PERMISSION: "role_permission",
  SYSTEM_SETTINGS: "system_settings",
  REPORTS: "reports",
  AUDIT_LOG: "audit_log",
} as const;

export type ManagementModuleKey = (typeof MANAGEMENT_MODULES)[keyof typeof MANAGEMENT_MODULES];
