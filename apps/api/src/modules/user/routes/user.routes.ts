import { Router } from "express";

import { authenticate } from "../../../auth";
import { validateRequest } from "../../../common";
import { UserProfileController } from "../controller";
import {
  EmailChangePrismaRepository,
  UserPreferencesPrismaRepository,
  UserPrismaRepository,
  UserProfilePrismaRepository,
} from "../repository";
import { UserProfileService } from "../service";
import {
  changePasswordSchema,
  confirmEmailChangeSchema,
  deactivateAccountSchema,
  requestEmailChangeSchema,
  updateAvatarSchema,
  updatePreferencesSchema,
  updateProfileSchema,
  userIdParamsSchema,
} from "../validation";

import type { AuthRepository, AuthService } from "../../auth";

/**
 * `modules/auth`'s `AuthService`/`AuthRepository`, reused here for
 * password-change and session-revocation-on-deactivation (see
 * `UserProfileService`'s class doc comment). Passed in rather than
 * constructed inside this module: `modules/auth` already takes a real
 * value-level dependency on `modules/user` (its service imports
 * `toUserResponseDto`; its own `passwordSchema` imports this module's
 * password-length constants), so this module never imports a *value*
 * back from `modules/auth` — only these two types, which TypeScript
 * erases entirely — keeping the dependency one-directional and the
 * module graph acyclic. The composition root (`routes/v1/index.ts`)
 * constructs the real instances and passes them to `createUserRouter`.
 */
export interface UserRouterDependencies {
  authService: AuthService;
  authRepository: AuthRepository;
}

/**
 * Builds the full User API surface, mounted at `/api/v1/users` (see
 * `routes/v1/index.ts`). `/me/*` routes require authentication and act
 * on the caller's own account; `/:id` is a read-only lookup that
 * returns the caller's own full profile for their own id, or a minimal
 * public subset for anyone else's (see `UserProfileService.getUserById`)
 * — so it's registered last, after every literal `/me...` path, to
 * avoid Express matching "me" as an `:id`. `/email-change/confirm`
 * deliberately takes no `authenticate` middleware, matching
 * `modules/auth`'s `/verify-email`: the token itself is the proof of
 * authorization, the same as a password-reset link.
 */
export function createUserRouter(dependencies: UserRouterDependencies): Router {
  const userRepository = new UserPrismaRepository();
  const profileRepository = new UserProfilePrismaRepository();
  const preferencesRepository = new UserPreferencesPrismaRepository();
  const emailChangeRepository = new EmailChangePrismaRepository();

  const userProfileService = new UserProfileService(
    userRepository,
    profileRepository,
    preferencesRepository,
    emailChangeRepository,
    dependencies.authService,
    dependencies.authRepository,
  );
  const userProfileController = new UserProfileController(userProfileService);

  const userRouter = Router();

  userRouter.get("/me", authenticate, userProfileController.getOwnProfile);
  userRouter.patch(
    "/me",
    authenticate,
    validateRequest({ body: updateProfileSchema }),
    userProfileController.updateProfile,
  );
  userRouter.put(
    "/me/avatar",
    authenticate,
    validateRequest({ body: updateAvatarSchema }),
    userProfileController.updateAvatar,
  );

  userRouter.get("/me/preferences", authenticate, userProfileController.getPreferences);
  userRouter.patch(
    "/me/preferences",
    authenticate,
    validateRequest({ body: updatePreferencesSchema }),
    userProfileController.updatePreferences,
  );

  userRouter.post(
    "/me/change-password",
    authenticate,
    validateRequest({ body: changePasswordSchema }),
    userProfileController.changePassword,
  );

  userRouter.post(
    "/me/email-change",
    authenticate,
    validateRequest({ body: requestEmailChangeSchema }),
    userProfileController.requestEmailChange,
  );
  userRouter.post(
    "/email-change/confirm",
    validateRequest({ body: confirmEmailChangeSchema }),
    userProfileController.confirmEmailChange,
  );

  userRouter.post(
    "/me/deactivate",
    authenticate,
    validateRequest({ body: deactivateAccountSchema }),
    userProfileController.deactivateAccount,
  );

  userRouter.get(
    "/:id",
    authenticate,
    validateRequest({ params: userIdParamsSchema }),
    userProfileController.getUserById,
  );

  return userRouter;
}
