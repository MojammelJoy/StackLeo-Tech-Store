import { sendSuccess } from "../../../common";
import { BadRequestError, UnauthorizedError } from "../../../errors";
import { asyncHandler } from "../../../utils";

import type { AuthenticatedUser } from "../../../auth";
import type { ChangePasswordDto } from "../../auth";
import type {
  ConfirmEmailChangeDto,
  DeactivateAccountDto,
  RequestEmailChangeDto,
  UpdateAvatarDto,
  UpdatePreferencesDto,
  UpdateProfileDto,
} from "../dto";
import type { UserProfileService } from "../service";
import type { Request } from "express";

function requireAuthenticatedUser(req: Request): AuthenticatedUser {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }
  return req.user;
}

function requireIdParam(req: Request): string {
  const id = req.params.id;
  if (!id) {
    throw new BadRequestError("User id is required");
  }
  return id;
}

/**
 * Express handlers for every User API endpoint. Each method is an
 * `asyncHandler`-wrapped arrow function (bound automatically, so
 * `routes/user.routes.ts` can reference `userProfileController.x`
 * directly), and does only three things: read the request, call one
 * `UserProfileService` method, and send the response — no business
 * logic lives here.
 */
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  getOwnProfile = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const user = await this.userProfileService.getOwnProfile(actor.id);
    sendSuccess(res, { user });
  });

  getUserById = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const targetId = requireIdParam(req);
    const user = await this.userProfileService.getUserById(actor.id, targetId);
    sendSuccess(res, { user });
  });

  updateProfile = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const dto = req.body as UpdateProfileDto;
    const user = await this.userProfileService.updateProfile(actor.id, dto);
    sendSuccess(res, { user });
  });

  updateAvatar = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const dto = req.body as UpdateAvatarDto;
    const user = await this.userProfileService.updateAvatar(actor.id, dto);
    sendSuccess(res, { user });
  });

  getPreferences = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const preferences = await this.userProfileService.getPreferences(actor.id);
    sendSuccess(res, { preferences });
  });

  updatePreferences = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const dto = req.body as UpdatePreferencesDto;
    const preferences = await this.userProfileService.updatePreferences(actor.id, dto);
    sendSuccess(res, { preferences });
  });

  changePassword = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const dto = req.body as ChangePasswordDto;
    await this.userProfileService.changePassword(actor.id, dto);
    sendSuccess(res, { message: "Password changed successfully" });
  });

  requestEmailChange = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const dto = req.body as RequestEmailChangeDto;
    const result = await this.userProfileService.requestEmailChange(actor.id, dto);
    sendSuccess(res, result);
  });

  confirmEmailChange = asyncHandler(async (req, res) => {
    const dto = req.body as ConfirmEmailChangeDto;
    await this.userProfileService.confirmEmailChange(dto);
    sendSuccess(res, { message: "Email address changed successfully" });
  });

  deactivateAccount = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const dto = req.body as DeactivateAccountDto;
    await this.userProfileService.deactivateAccount(actor.id, dto);
    sendSuccess(res, { message: "Account deactivated" });
  });
}
