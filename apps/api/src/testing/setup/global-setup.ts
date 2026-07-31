import { applyTestEnvDefaults } from "../config";

import { runGlobalTeardown } from "./global-teardown";

/**
 * Vitest's global setup — runs once, in its own process, before any
 * test file starts, and (per Vitest's own `globalSetup` contract) may
 * return a function used as global teardown. Cannot mutate
 * `process.env` for the actual *worker* processes that run test files
 * (see `config/test-env.config.ts`'s comment) — that guarantee comes
 * from `vitest.config.ts`'s `test.env` field instead. This still
 * applies the same defaults to its own process so any one-time setup
 * logic added here later can rely on `config/` loading validly too.
 */
export default function globalSetup(): () => void {
  applyTestEnvDefaults();
  return () => {
    runGlobalTeardown();
  };
}
