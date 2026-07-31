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
export default defineConfig({
  test: {
    environment: "node",
    globalSetup: ["./src/testing/setup/global-setup.ts"],
    env: { ...TEST_ENV_DEFAULTS },
  },
});
