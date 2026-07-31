/** Default role sets `factories/authenticated-user.factory.ts` and
 * `factories/user.factory.ts` build from — real, tiny role vocabularies
 * for tests, independent of whatever `modules/rbac` currently defines
 * (this module never imports `modules/rbac`). */
export const DEFAULT_TEST_USER_ROLES = ["customer"] as const;
export const DEFAULT_TEST_ADMIN_ROLES = ["admin"] as const;
