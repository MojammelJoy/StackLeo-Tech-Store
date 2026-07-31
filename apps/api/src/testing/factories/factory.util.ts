import type { DeepPartial } from "../types";

/**
 * Builds a factory function for `T` from a `buildDefaults` thunk —
 * every one of `factories/*.factory.ts`'s concrete factories is defined
 * in terms of this one helper, so "call the thunk fresh, then apply
 * overrides on top" only needs to be implemented once. `buildDefaults`
 * runs on every call (never memoized), so id/email-shaped defaults stay
 * unique across calls within the same test.
 */
export function createFactory<T>(buildDefaults: () => T): (overrides?: DeepPartial<T>) => T {
  return (overrides) => ({ ...buildDefaults(), ...(overrides as Partial<T>) });
}
