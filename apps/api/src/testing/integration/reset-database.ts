import { prisma } from "../../database";

/**
 * Every table this schema defines (see `prisma/schema.prisma`'s
 * `@@map(...)` names), truncated in one statement between tests.
 * `TRUNCATE ... CASCADE` doesn't need dependency ordering the way
 * `DELETE` would — Postgres resolves every FK relationship among the
 * listed tables (and any dependent table not listed) atomically. Kept
 * as an explicit, fully-static list — never derived from user input or
 * a dynamic introspection query — so `$executeRawUnsafe` here carries
 * no injection risk, the same "only ever wrap a code-controlled value"
 * rule this app's other raw-SQL call sites already follow.
 */
const ALL_TABLES = [
  "review_helpful_votes",
  "review_rating_summaries",
  "reviews",
  "notifications",
  "coupon_redemptions",
  "coupons",
  "payment_transactions",
  "payments",
  "order_status_history",
  "order_items",
  "orders",
  "addresses",
  "wishlist_items",
  "wishlists",
  "cart_items",
  "carts",
  "inventory_movements",
  "inventory_items",
  "media_assets",
  "product_specifications",
  "product_variants",
  "products",
  "brands",
  "categories",
  "system_settings",
  "email_change_tokens",
  "user_preferences",
  "user_profiles",
  "password_reset_tokens",
  "email_verification_tokens",
  "refresh_tokens",
  "users",
] as const;

/**
 * Wipes every business table in the integration test database
 * (`stackleo_test` — see `testing/constants/test-env.constants.ts`'s
 * `TEST_ENV_DEFAULTS.DATABASE_URL`) and resets identity sequences
 * (`Order.sequenceNumber`/`Payment.sequenceNumber`), so every
 * integration test starts from a known-empty state regardless of what
 * earlier tests left behind. Call from `beforeEach` in every
 * `*.integration.test.ts` file — never against `stackleo_dev`: this
 * would be destructive there, but every test worker's `DATABASE_URL`
 * already points at the dedicated test database, never dev.
 */
export async function resetDatabase(): Promise<void> {
  const tableList = ALL_TABLES.map((table) => `"${table}"`).join(", ");
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE;`);
}
