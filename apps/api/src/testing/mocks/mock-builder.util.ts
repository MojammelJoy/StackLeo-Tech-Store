import { vi } from "vitest";

import type { Mocked } from "../types";

/**
 * Builds a fully-mocked stand-in for any interface `T` — every method
 * named in `methodNames` becomes a fresh `vi.fn()`. TypeScript has no
 * runtime reflection of an interface's members, so the caller supplies
 * them explicitly; this is the generic building block every one of
 * `repository/`'s and `service/`'s own smoke-test fakes (hand-built
 * object literals satisfying an interface) could be replaced with.
 */
export function createMockOf<T extends object>(methodNames: readonly (keyof T)[]): Mocked<T> {
  const mock: Record<PropertyKey, unknown> = {};
  for (const methodName of methodNames) {
    mock[methodName as PropertyKey] = vi.fn();
  }
  return mock as Mocked<T>;
}
