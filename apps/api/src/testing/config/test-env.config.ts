import { TEST_ENV_DEFAULTS } from "../constants";

/**
 * Ensures every environment variable `config/env.schema.ts` requires is
 * present, without overwriting anything already set (so CI or a
 * developer's shell can still override a value deliberately). The
 * primary place these defaults reach a test *worker's* `process.env` is
 * `vitest.config.ts`'s `test.env` field — Vitest applies that before any
 * worker imports application code, which a `globalSetup` file (running
 * in its own separate process) cannot do. This function exists for the
 * secondary case: a script, or `setup/global-setup.ts` itself, that
 * needs the same defaults applied imperatively.
 */
export function applyTestEnvDefaults(overrides: Partial<typeof TEST_ENV_DEFAULTS> = {}): void {
  const values: Record<string, string> = { ...TEST_ENV_DEFAULTS, ...overrides };
  for (const [key, value] of Object.entries(values)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}
