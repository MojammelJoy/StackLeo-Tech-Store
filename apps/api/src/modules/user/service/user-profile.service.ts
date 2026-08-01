import { verifyPassword } from "../../../auth";
import { config } from "../../../config";
import { ConflictError, NotFoundError, UnauthorizedError } from "../../../errors";
import { logger } from "../../../logger";
import { EMAIL_CHANGE_TOKEN_TTL_MS } from "../constants";
import {
  toPublicUserProfileDto,
  toUserPreferencesResponseDto,
  toUserProfileResponseDto,
} from "../dto";
import { generateRawToken, hashToken } from "../utils";

import type { AuthRepository, AuthService, ChangePasswordDto } from "../../auth";
import type {
  ConfirmEmailChangeDto,
  DeactivateAccountDto,
  PublicUserProfileDto,
  RequestEmailChangeDto,
  RequestEmailChangeResponseDto,
  UpdateAvatarDto,
  UpdatePreferencesDto,
  UpdateProfileDto,
  UserPreferencesResponseDto,
  UserProfileResponseDto,
} from "../dto";
import type {
  EmailChangeRepository,
  UserPreferencesRepository,
  UserProfileRepository,
  UserRepository,
} from "../repository";
import type { UserPreferences, UserProfile } from "../types";

/**
 * Implements every User API operation: profile read/update, avatar
 * metadata, preferences, change email (request + confirm), change
 * password, and account deactivation. Depends on `UserRepository`
 * (account persistence, from this module) plus `UserProfileRepository`/
 * `UserPreferencesRepository`/`EmailChangeRepository` (this module's own
 * new persistence), and on `modules/auth`'s `AuthService`/
 * `AuthRepository` for the two operations this module deliberately
 * reuses rather than reimplements: changing a password (identical
 * verify-then-rehash-then-revoke-sessions logic already lives in
 * `AuthService.changePassword`) and revoking every session on
 * deactivation (`AuthRepository.revokeAllRefreshTokensForUser`).
 */
export class UserProfileService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly profileRepository: UserProfileRepository,
    private readonly preferencesRepository: UserPreferencesRepository,
    private readonly emailChangeRepository: EmailChangeRepository,
    private readonly authService: AuthService,
    private readonly authRepository: AuthRepository,
  ) {}

  async getOwnProfile(userId: string): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const profile = await this.getOrCreateProfile(userId);
    return toUserProfileResponseDto(user, profile);
  }

  /** Full profile for the caller viewing their own account; otherwise
   * the minimal public subset, gated by the target being active and
   * having opted into `UserProfile.isPublic` — never a distinguishing
   * error for "exists but private" versus "doesn't exist", so this
   * endpoint can never be used to enumerate accounts. */
  async getUserById(
    viewerId: string,
    targetId: string,
  ): Promise<UserProfileResponseDto | PublicUserProfileDto> {
    if (targetId === viewerId) {
      return this.getOwnProfile(viewerId);
    }

    const targetUser = await this.userRepository.findById(targetId);
    if (!targetUser || !targetUser.isActive) {
      throw new NotFoundError("User not found");
    }

    const targetProfile = await this.profileRepository.findByUserId(targetId);
    if (!targetProfile || !targetProfile.isPublic) {
      throw new NotFoundError("User not found");
    }

    return toPublicUserProfileDto(targetUser, targetProfile);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const profile = await this.profileRepository.upsert(userId, dto);
    return toUserProfileResponseDto(user, profile);
  }

  async updateAvatar(userId: string, dto: UpdateAvatarDto): Promise<UserProfileResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const profile = await this.profileRepository.updateAvatar(userId, dto.avatarUrl);
    return toUserProfileResponseDto(user, profile);
  }

  async getPreferences(userId: string): Promise<UserPreferencesResponseDto> {
    const preferences = await this.getOrCreatePreferences(userId);
    return toUserPreferencesResponseDto(preferences);
  }

  async updatePreferences(
    userId: string,
    dto: UpdatePreferencesDto,
  ): Promise<UserPreferencesResponseDto> {
    const preferences = await this.preferencesRepository.upsert(userId, dto);
    return toUserPreferencesResponseDto(preferences);
  }

  /** Reuses `AuthService.changePassword` outright — verifying the
   * current password, hashing the new one, and revoking every session
   * is identical logic regardless of which module's route triggered it. */
  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    await this.authService.changePassword(userId, dto);
  }

  async requestEmailChange(
    userId: string,
    dto: RequestEmailChangeDto,
  ): Promise<RequestEmailChangeResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const currentPasswordIsValid = await verifyPassword(dto.currentPassword, user.passwordHash);
    if (!currentPasswordIsValid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    if (dto.newEmail === user.email) {
      throw new ConflictError("New email must be different from the current email");
    }

    const alreadyExists = await this.userRepository.existsByEmail(dto.newEmail);
    if (alreadyExists) {
      throw new ConflictError("An account with that email already exists");
    }

    // Invalidate any still-pending request before issuing a new one, so
    // at most one email-change token is ever valid at a time.
    await this.emailChangeRepository.invalidateAllForUser(userId);

    const rawToken = generateRawToken();
    await this.emailChangeRepository.create({
      userId,
      newEmail: dto.newEmail,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + EMAIL_CHANGE_TOKEN_TTL_MS),
    });
    logger.info({ userId }, "Email change requested; confirmation token issued");

    return {
      message: "Confirm this change using the link sent to your new email address.",
      // No email-sending provider is wired in yet (every provider in
      // modules/notification is still a skeleton) — echo the raw token
      // outside production so the flow is actually usable end to end
      // until one exists. Never echoed in production.
      ...(config.isProduction ? {} : { emailChangeToken: rawToken }),
    };
  }

  async confirmEmailChange(dto: ConfirmEmailChangeDto): Promise<void> {
    const tokenHash = hashToken(dto.token);
    const record = await this.emailChangeRepository.findByTokenHash(tokenHash);

    if (!record || record.usedAt || record.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedError("Email change token is invalid or has expired");
    }

    const alreadyExists = await this.userRepository.existsByEmail(record.newEmail);
    if (alreadyExists) {
      throw new ConflictError("An account with that email already exists");
    }

    await this.userRepository.update(record.userId, { email: record.newEmail });
    await this.emailChangeRepository.markUsed(record.id);
    logger.info({ userId: record.userId }, "Email change confirmed");
  }

  async deactivateAccount(userId: string, dto: DeactivateAccountDto): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const currentPasswordIsValid = await verifyPassword(dto.currentPassword, user.passwordHash);
    if (!currentPasswordIsValid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    await this.userRepository.update(userId, { isActive: false });
    await this.authRepository.revokeAllRefreshTokensForUser(userId);
    logger.info({ userId }, "Account deactivated");
  }

  private async getOrCreateProfile(userId: string): Promise<UserProfile> {
    const existing = await this.profileRepository.findByUserId(userId);
    if (existing) {
      return existing;
    }
    return this.profileRepository.upsert(userId, {});
  }

  private async getOrCreatePreferences(userId: string): Promise<UserPreferences> {
    const existing = await this.preferencesRepository.findByUserId(userId);
    if (existing) {
      return existing;
    }
    return this.preferencesRepository.upsert(userId, {});
  }
}
