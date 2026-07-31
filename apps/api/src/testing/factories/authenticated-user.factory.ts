import { DEFAULT_TEST_USER_ROLES } from "../constants";
import { randomTestId } from "../utils";

import { createFactory } from "./factory.util";

import type { AuthenticatedUser } from "../../auth/types";

/** Builds a fake `AuthenticatedUser` (see `auth/types/auth.types.ts`) —
 * the `actor` shape most service-skeleton methods across every module
 * in this app accept, and what `helpers/auth.helper.ts`'s
 * `signTestAccessToken` signs a token for. */
export const createTestAuthenticatedUser = createFactory<AuthenticatedUser>(() => ({
  id: randomTestId("user"),
  roles: [...DEFAULT_TEST_USER_ROLES],
}));
