/**
 * Real-database integration/E2E test infrastructure: a real HTTP server
 * built from the actual `createApp()` composition (`test-server.ts`), a
 * cookie-jar-aware HTTP client since `modules/auth` returns tokens as
 * httpOnly cookies (`http-client.ts`), a real-registration auth flow
 * helper (`auth-flow.ts`), and a full-database truncation utility
 * (`reset-database.ts`).
 *
 * Deliberately NOT re-exported through `testing/index.ts` — every file
 * here imports `database/`'s real `prisma` client (needed to talk to
 * the dedicated `stackleo_test` database), and keeping that import
 * boundary out of the top-level `testing/` barrel keeps the existing,
 * fast, DB-free unit test suite (`testing/mocks/`, `testing/factories/`,
 * ...) untouched. `*.integration.test.ts` files import straight from
 * this module instead.
 */
export { registerAndLoginTestUser, elevateToAdmin, TEST_USER_PASSWORD } from "./auth-flow";
export type { RegisteredTestUser } from "./auth-flow";

export { TestHttpClient } from "./http-client";
export type { ApiResponse } from "./http-client";

export { resetDatabase } from "./reset-database";

export { startTestServer } from "./test-server";
export type { TestServer } from "./test-server";
