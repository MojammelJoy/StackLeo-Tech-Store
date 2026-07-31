import { DEFAULT_TEST_USER_ROLES } from "../constants";
import { randomTestEmail, randomTestId } from "../utils";

import { createFactory } from "./factory.util";

import type { User } from "../../modules/user/types";

/**
 * Builds a fake `User` (see `modules/user/types/user.types.ts`) for
 * unit/integration tests — `passwordHash` is a fixed, obviously-fake
 * bcrypt-shaped string, never a real hash of a real password, since
 * nothing here needs to actually verify it.
 */
export const createTestUser = createFactory<User>(() => ({
  id: randomTestId("user"),
  email: randomTestEmail(),
  passwordHash: "$2a$10$test.fake.hash.never.use.in.prod.0000000000000000",
  roles: [...DEFAULT_TEST_USER_ROLES],
  isActive: true,
  isEmailVerified: false,
  emailVerifiedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}));
