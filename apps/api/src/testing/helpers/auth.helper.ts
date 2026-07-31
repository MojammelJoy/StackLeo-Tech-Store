import { BEARER_PREFIX, issueAccessToken } from "../../auth";
import { createTestAuthenticatedUser } from "../factories";

import type { AuthenticatedUser } from "../../auth";

/** The `Authorization` header value for `token` — reuses `auth/`'s own
 * `BEARER_PREFIX` rather than hardcoding `"Bearer "` a second time. */
export function buildAuthHeader(token: string): string {
  return `${BEARER_PREFIX}${token}`;
}

/**
 * Signs a real, verifiable access token for `user` (defaulting to a
 * fresh `createTestAuthenticatedUser()`) using `auth/`'s own
 * `issueAccessToken` — the same signing path production code uses, so
 * a token built here round-trips through `auth/`'s `verifyAccessToken`/
 * `authenticate` middleware exactly like a real one would. Requires
 * `config.auth.jwt.accessSecret` to already be set, which
 * `vitest.config.ts`'s `test.env` guarantees for every test worker.
 */
export function signTestAccessToken(
  user: AuthenticatedUser = createTestAuthenticatedUser(),
): string {
  return issueAccessToken({ sub: user.id, roles: user.roles });
}
