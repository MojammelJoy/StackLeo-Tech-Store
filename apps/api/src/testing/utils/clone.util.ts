/** A real structural clone (not a JSON round-trip, so `Date`/`Map`/`Set`
 * survive intact) — for asserting a function didn't mutate its input,
 * or handing out an isolated copy of a shared fixture. */
export function deepClone<T>(value: T): T {
  return structuredClone(value);
}
