/**
 * The User API: read/update the caller's own profile, avatar metadata,
 * and preferences; look up another user's public profile; change email
 * (request + confirm) and password; deactivate the account — a real,
 * working feature, not reusable-infrastructure-only scaffolding. Built
 * on `common/`, `auth/` (JWT/password infra), `database/`, `logger/`,
 * and (for password-change and session-revocation logic; see
 * `UserProfileService`'s class doc comment) `modules/auth`'s
 * `AuthService`/`AuthRepository` — taken as constructor/factory
 * *parameters*, never imported as values here, since `modules/auth`
 * already depends on this module (its service imports
 * `toUserResponseDto`; its own `passwordSchema` imports this module's
 * password-length constants) and a value import back would make that a
 * real module-load cycle. `createUserRouter` therefore takes its
 * `AuthService`/`AuthRepository` instances from its caller — see
 * `routes/v1/index.ts`, the composition root that constructs them and
 * wires this module's router together with `modules/auth`'s. This
 * module deliberately excludes admin user management, role management,
 * authentication itself, and any other domain's business logic.
 */
export {
  EMAIL_CHANGE_TOKEN_TTL_MS,
  USER_AVATAR_URL_MAX_LENGTH,
  USER_BIO_MAX_LENGTH,
  USER_DISPLAY_NAME_MAX_LENGTH,
  USER_FILTERABLE_FIELDS,
  USER_LOCALE_MAX_LENGTH,
  USER_PASSWORD_MAX_LENGTH,
  USER_PASSWORD_MIN_LENGTH,
  USER_PHONE_NUMBER_MAX_LENGTH,
  USER_SORTABLE_FIELDS,
  USER_THEME_VALUES,
  USER_TIMEZONE_MAX_LENGTH,
} from "./constants";

export type { CreateUserInput, UpdateUserInput, User } from "./types";
export type {
  CreateEmailChangeTokenInput,
  EmailChangeTokenRecord,
  UpsertUserPreferencesInput,
  UpsertUserProfileInput,
  UserPreferences,
  UserProfile,
} from "./types";

export {
  createUserSchema,
  toPublicUserProfileDto,
  toUserPreferencesResponseDto,
  toUserProfileResponseDto,
  toUserResponseDto,
  updateUserSchema,
} from "./dto";
export type {
  ConfirmEmailChangeDto,
  CreateUserDto,
  DeactivateAccountDto,
  PublicUserProfileDto,
  RequestEmailChangeDto,
  RequestEmailChangeResponseDto,
  UpdateAvatarDto,
  UpdatePreferencesDto,
  UpdateProfileDto,
  UpdateUserDto,
  UserPreferencesResponseDto,
  UserProfileResponseDto,
  UserResponseDto,
} from "./dto";

export {
  changePasswordSchema,
  confirmEmailChangeSchema,
  deactivateAccountSchema,
  requestEmailChangeSchema,
  updateAvatarSchema,
  updatePreferencesSchema,
  updateProfileSchema,
  userIdParamsSchema,
} from "./validation";

export type { UserRepository } from "./repository";
export { UserPrismaRepository } from "./repository";
export type {
  EmailChangeRepository,
  UserPreferencesRepository,
  UserProfileRepository,
} from "./repository";
export {
  EmailChangePrismaRepository,
  UserPreferencesPrismaRepository,
  UserProfilePrismaRepository,
} from "./repository";

export { UserService } from "./service";
export { UserProfileService } from "./service";

export { UserProfileController } from "./controller";

export { createUserRouter } from "./routes";
export type { UserRouterDependencies } from "./routes";
