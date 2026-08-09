import { createApp } from "../../app";

import type { Server } from "node:http";

/**
 * Boots the real, fully-wired `createApp()` (same composition as
 * production — every module's real router, real middleware chain,
 * real error handler) on an ephemeral port for HTTP-level integration
 * tests. Nothing about the app itself is swapped out; only its
 * `DATABASE_URL`/`REDIS_URL` differ, via `TEST_ENV_DEFAULTS` (see
 * `testing/constants/test-env.constants.ts`), which point at the
 * dedicated `stackleo_test` database/Redis DB index instead of dev.
 */
export interface TestServer {
  baseUrl: string;
  close: () => Promise<void>;
}

export async function startTestServer(): Promise<TestServer> {
  const app = createApp();
  const server: Server = await new Promise((resolve) => {
    const listening = app.listen(0, () => resolve(listening));
  });

  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 0;

  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}
