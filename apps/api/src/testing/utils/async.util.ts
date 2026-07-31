import { TEST_TIMEOUTS } from "../constants";

/** Flushes any pending microtasks (resolved promises, `queueMicrotask`
 * callbacks) — useful after triggering an async operation a test
 * doesn't hold a promise for directly (e.g. a fire-and-forget
 * callback). */
export async function flushPromises(): Promise<void> {
  await new Promise((resolve) => setImmediate(resolve));
}

/**
 * Polls `condition` until it returns `true` or `timeoutMs` elapses,
 * rejecting in the latter case. For asserting on eventually-consistent
 * state (e.g. a mock being called) without a fixed, guessed delay.
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeoutMs: number = TEST_TIMEOUTS.DEFAULT,
  intervalMs: number = TEST_TIMEOUTS.SHORT / 10,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`waitFor: condition not met within ${timeoutMs}ms`);
}
