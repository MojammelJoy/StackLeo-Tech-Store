import { defineConfig } from "vitest/config";

import { TEST_ENV_DEFAULTS } from "./src/testing/constants/test-env.constants";

/**
 * `test.env` is what actually guarantees every test *worker* process
 * has the environment variables `config/env.schema.ts` requires before
 * it imports any application code — a `globalSetup` file runs in its
 * own separate process and cannot mutate a worker's `process.env` (see
 * `src/testing/config/test-env.config.ts`'s comment). `globalSetup`
 * still runs `src/testing/setup/global-setup.ts` for whatever
 * once-per-run setup/teardown this foundation's tests need beyond env
 * variables.
 */
const SHARED_EXCLUDE = ["**/node_modules/**", "**/.git/**", "**/dist/**"];

export default defineConfig({
  test: {
    environment: "node",
    globalSetup: ["./src/testing/setup/global-setup.ts"],
    env: { ...TEST_ENV_DEFAULTS },
    // `tsc -b`'s incremental build (the root `pnpm typecheck`) emits
    // compiled output to `dist/`, including compiled `*.test.js` files
    // unless `tsconfig.json` excludes test sources from the build (see
    // that file's `exclude`) — this is defense in depth against Vitest
    // ever double-running a test from both its `.ts` source and a stale
    // compiled `.js` copy left over in `dist/`.
    exclude: SHARED_EXCLUDE,
    // This app is still in its foundation phase — every module built so
    // far is reusable infrastructure (types, DTOs, skeleton services),
    // not yet the business logic real tests would exercise (see
    // src/testing/'s own doc comments). Vitest's default behavior is to
    // fail the run when zero test files match, which is right for a
    // mature suite (an empty run usually means a broken glob) but wrong
    // here, where zero test files is the expected, honest state. This
    // keeps `pnpm test` — and CI's `Test` step — green without writing
    // placeholder tests just to produce a passing exit code.
    passWithNoTests: true,
    // Two projects sharing every setting above (`extends: true`) except
    // which files each runs and how parallel each is:
    //   - "unit": every existing `*.test.ts` — mocked Prisma/repos, no
    //     real database, safe to run fully parallel across files (the
    //     default, unchanged from before this project split existed).
    //   - "integration": `*.integration.test.ts` — a real HTTP server
    //     backed by the real `stackleo_test` Postgres database (see
    //     `testing/integration/`). These all share ONE database and
    //     each truncates it in `beforeEach` (`resetDatabase`), so
    //     running two integration files' tests concurrently would let
    //     one file's truncation wipe out another's in-flight fixtures —
    //     `fileParallelism: false` forces integration files to run one
    //     at a time (tests *within* a file still run in Vitest's normal
    //     sequential-by-default order). Unit tests are unaffected.
    projects: [
      {
        extends: true,
        test: { name: "unit", exclude: [...SHARED_EXCLUDE, "**/*.integration.test.ts"] },
      },
      {
        extends: true,
        test: {
          name: "integration",
          include: ["**/*.integration.test.ts"],
          fileParallelism: false,
        },
      },
    ],
  },
});
