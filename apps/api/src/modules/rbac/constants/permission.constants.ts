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
  /** Every cart mutation (add/update/remove/clear/merge item) is
   * self-service — a caller acts only on their own cart, enforced by
   * `modules/cart`'s own ownership checks, never a permission — so the
   * only cart capability that needs a permission at all is staff
   * browsing *other* shoppers' carts (the admin-facing paginated
   * listing). */
  CART_READ: "cart:read",
  /** Every read/cancel on an order is self-service — a caller acts
   * only on their own order, enforced by `modules/order`'s own
   * ownership checks, never a permission. Progressing an order beyond
   * cancellation (`pending` → `confirmed` → `processing` → `completed`,
   * or issuing a `refunded` status) is an operational/staff action a
   * plain customer never performs on their own order, so
   * `PATCH /orders/:id/status` is gated by this permission instead of
   * ownership — see `OrderService.updateStatus`. */
  ORDER_UPDATE: "order:update",
  /** Coupons are admin-managed, never user-owned (unlike Cart/Order):
   * every CRUD/listing/restore endpoint in `modules/coupon` is gated by
   * one of these, mirroring `modules/product`/`modules/category`/
   * `modules/brand`'s `*_CREATE`/`*_UPDATE`/`*_DELETE` (and, unlike
   * those catalog modules, `COUPON_READ` too — there is no anonymous
   * "browse the coupon catalog" storefront path, since a coupon's value
   * (min order amount, discount, eligibility) isn't meant to be
   * broadly discoverable). Applying/validating/removing a coupon on
   * one's own cart needs no permission at all — see
   * `modules/coupon/routes/coupon.routes.ts`. */
  COUPON_READ: "coupon:read",
  COUPON_CREATE: "coupon:create",
  COUPON_UPDATE: "coupon:update",
  COUPON_DELETE: "coupon:delete",
  /** Every review create/update/vote is self-service, and every listing
   * is already visibility-scoped to `APPROVED` reviews plus the caller's
   * own (see `modules/review/service/review.service.ts`'s
   * `scopeFiltersForActor`) — so this single permission is the only one
   * the module needs: it lifts that visibility scope (seeing every
   * status, not just approved-or-own) and gates the moderator-only
   * actions (changing `moderationStatus`, deleting/restoring someone
   * else's review). Mirrors `ORDER_UPDATE`'s "one permission for the
   * one staff-only capability" shape. */
  REVIEW_MODERATE: "review:moderate",
  /** Every read/cancel on an order is self-service (see `ORDER_UPDATE`'s
   * doc comment) — `modules/order` itself has no staff-wide "read any
   * order" capability at all. `ORDER_READ` exists purely for
   * `modules/admin`'s order-management surface: viewing an arbitrary
   * customer's order/timeline/listing every order across every
   * customer, distinct from `ORDER_UPDATE` (progressing one). */
  ORDER_READ: "order:read",
  /** `modules/notification` is fully self-service — a caller only ever
   * sees their own notifications, no permission involved at all. This
   * exists purely for `modules/admin`'s operational visibility into
   * every user's notifications (list/inspect/summary), never a
   * capability `modules/notification`'s own routes use. */
  NOTIFICATION_READ: "notification:read",
  /** `modules/payment` is fully self-service — a caller only ever sees
   * their own payments. This exists purely for `modules/admin`'s
   * read-only operational visibility (status summary, records by
   * order) — never gateway integration, capture, or refund, which
   * remain explicitly out of scope for the Admin API. */
  PAYMENT_READ: "payment:read",
  /** Gates `modules/admin`'s cross-domain dashboard overview — a
   * capability that doesn't belong to any single existing domain, so it
   * gets its own permission rather than being folded into one of the
   * domain-specific `*_READ`s above. */
  ADMIN_DASHBOARD_READ: "admin:dashboard:read",
  /** `SystemSetting` (see `modules/admin`'s own foundation) is
   * platform-wide configuration, never user- or order-scoped, so it
   * follows the same flat `*_READ`/`*_CREATE`/`*_UPDATE`/`*_DELETE`
   * shape as `modules/coupon`'s `COUPON_*` rather than any narrower
   * split. */
  SYSTEM_SETTINGS_READ: "system_settings:read",
  SYSTEM_SETTINGS_CREATE: "system_settings:create",
  SYSTEM_SETTINGS_UPDATE: "system_settings:update",
  SYSTEM_SETTINGS_DELETE: "system_settings:delete",
  /** Gates every endpoint in `modules/analytics` — read-only reporting
   * across every domain (sales/revenue/order/product/category/customer/
   * inventory/coupon/review/payment), so one permission covers the
   * whole module rather than a `*_READ` per domain: unlike
   * `modules/admin` (whose domain sub-routers reuse each domain's own
   * granular permission because they can also *write*), Analytics never
   * writes anything, and its reports routinely blend several domains in
   * a single response (the dashboard overview, comparisons), so
   * per-domain gating would just mean every route requires the same set
   * of permissions anyway. */
  ANALYTICS_READ: "analytics:read",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
