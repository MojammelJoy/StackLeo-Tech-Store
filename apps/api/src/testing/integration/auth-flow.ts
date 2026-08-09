import { prisma } from "../../database";
import { randomTestEmail } from "../utils";

import { TestHttpClient } from "./http-client";

import type { ApiResponse } from "./http-client";

export const TEST_USER_PASSWORD = "Str0ng-Test-Password!";

export interface RegisteredTestUser {
  client: TestHttpClient;
  userId: string;
  email: string;
}

interface RegisterResponseBody {
  data: { user: { id: string; email: string } };
}

/**
 * Registers and logs in a real user through the real HTTP endpoints
 * (`POST /api/v1/auth/register` then `POST /api/v1/auth/login`) against
 * the integration test database — never a synthetic/unpersisted actor.
 * `createTestAuthenticatedUser`/`signTestAccessToken`
 * (`testing/factories`, `testing/helpers`) sign a *valid* JWT for a user
 * id that was never inserted into `stackleo_test`, which satisfies
 * `authenticate`'s signature check but violates the foreign-key-shaped
 * `userId` columns every downstream write in this flow depends on
 * (orders, addresses, reviews, ...) — registering for real is what
 * every integration test in this suite needs instead.
 *
 * Every registered user starts with `User.roles = ["member"]` (the
 * schema default) and therefore holds no RBAC permissions beyond
 * `user:read` — the correct baseline for "customer" test actors. Use
 * `elevateToAdmin` for tests that need staff permissions.
 */
export async function registerAndLoginTestUser(
  baseUrl: string,
  overrides: { email?: string; password?: string } = {},
): Promise<RegisteredTestUser> {
  const email = overrides.email ?? randomTestEmail();
  const password = overrides.password ?? TEST_USER_PASSWORD;
  const client = new TestHttpClient(baseUrl);

  const registerResponse = (await client.post("/api/v1/auth/register", {
    email,
    password,
  })) as ApiResponse<RegisterResponseBody>;
  if (registerResponse.status !== 201) {
    throw new Error(
      `Test user registration failed (${registerResponse.status}): ${JSON.stringify(registerResponse.body)}`,
    );
  }

  const loginResponse = await client.post("/api/v1/auth/login", { email, password });
  if (loginResponse.status !== 200) {
    throw new Error(
      `Test user login failed (${loginResponse.status}): ${JSON.stringify(loginResponse.body)}`,
    );
  }

  return { client, userId: registerResponse.body.data.user.id, email };
}

/**
 * Elevates an already-registered user to a staff role directly in
 * Postgres (there is no self-service "become admin" endpoint — this
 * mirrors how a real deployment would seed its first admin), then logs
 * in again so the freshly-issued access token's `roles` JWT claim
 * reflects the change (`authenticate` reads `roles` straight off the
 * token payload — see `auth/middleware/authenticate.middleware.ts` — so
 * a token issued *before* the DB update would still carry the stale
 * `["member"]` claim).
 */
export async function elevateToAdmin(
  user: RegisteredTestUser,
  password = TEST_USER_PASSWORD,
): Promise<void> {
  await prisma.user.update({ where: { id: user.userId }, data: { roles: ["admin"] } });
  const loginResponse = await user.client.post("/api/v1/auth/login", {
    email: user.email,
    password,
  });
  if (loginResponse.status !== 200) {
    throw new Error(`Re-login after admin elevation failed (${loginResponse.status})`);
  }
}
