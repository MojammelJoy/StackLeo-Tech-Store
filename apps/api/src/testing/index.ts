/**
 * Reusable testing infrastructure for this app's Vitest suite: test
 * configuration (`config/`) and constants (`constants/`) that keep
 * `config/env.schema.ts` satisfied in every test worker, generic
 * data factories (`factories/`) built on real domain types from
 * `modules/`, deterministic sample datasets (`fixtures/`), Express
 * request/response and auth/validation helpers (`helpers/`), safe
 * Prisma/Redis/database mocks that never touch a real connection
 * (`mocks/`), shared testing types (`types/`), pure async/random/clone
 * utilities (`utils/`), and Vitest's global setup/teardown (`setup/`).
 * No business, controller, route, or CRUD tests live here — this is
 * the plumbing those will depend on once they exist.
 */
export {
  DEFAULT_TEST_ADMIN_ROLES,
  DEFAULT_TEST_USER_ROLES,
  TEST_ENV_DEFAULTS,
  TEST_TIMEOUTS,
} from "./constants";

export { applyTestEnvDefaults } from "./config";

export type { DeepPartial, E2ETestContext, Mocked, TestContext } from "./types";

export { flushPromises, waitFor, deepClone, randomTestEmail, randomTestId } from "./utils";

export {
  createFactory,
  createTestAuthenticatedUser,
  createTestOrder,
  createTestProduct,
  createTestUser,
} from "./factories";

export { SAMPLE_PRODUCTS, SAMPLE_USERS } from "./fixtures";

export type { MockDatabaseModule } from "./mocks";
export {
  createMockDatabaseModule,
  createMockOf,
  createMockPrismaClient,
  createMockRedisClient,
} from "./mocks";

export type { MockRequestOptions, MockResponse } from "./helpers";
export {
  buildAuthHeader,
  buildMockRequest,
  buildMockResponse,
  expectZodError,
  expectZodSuccess,
  signTestAccessToken,
} from "./helpers";

export { globalSetup, runGlobalTeardown } from "./setup";
