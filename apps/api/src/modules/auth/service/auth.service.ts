import { hashPassword, issueTokenPair, verifyPassword, verifyRefreshToken } from "../../../auth";
import { config } from "../../../config";
import { ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from "../../../errors";
import { logger } from "../../../logger";
import { ROLES } from "../../rbac";
import { toUserResponseDto } from "../../user";
import {
  EMAIL_VERIFICATION_TOKEN_TTL_MS,
  GENERIC_FORGOT_PASSWORD_MESSAGE,
  PASSWORD_RESET_TOKEN_TTL_MS,
} from "../constants";
import { authMapper } from "../mapper";
import { generateRawToken, hashToken } from "../utils";

import type { TokenPair } from "../../../auth";
import type { UserRepository, UserResponseDto } from "../../user";
import type {
  ChangePasswordDto,
  ForgotPasswordDto,
  ForgotPasswordResponseDto,
  LoginDto,
  RegisterDto,
  RegisterResponseDto,
  ResetPasswordDto,
  SessionResponseDto,
  VerifyEmailDto,
} from "../dto";
import type { RequestContext } from "../interfaces";
import type { AuthRepository } from "../repository";
import type { RefreshTokenRecord } from "../types";

export interface LoginResult {
  user: UserResponseDto;
  tokens: TokenPair;
}

/**
 * Implements every Authentication API operation: register, login,
 * logout, refresh (with rotation + reuse detection), email
 * verification, forgot/reset/change password, current user, and
 * session management. Depends on `UserRepository` (from
 * `modules/user`, for account persistence) and `AuthRepository` (this
 * module's own token/session persistence) — never on Prisma directly,
 * so either can be swapped independently of this class.
 */
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authRepository: AuthRepository,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    const alreadyExists = await this.userRepository.existsByEmail(dto.email);
    if (alreadyExists) {
      throw new ConflictError("An account with that email already exists");
    }

    const passwordHash = await hashPassword(dto.password);
    const user = await this.userRepository.create({
      email: dto.email,
      passwordHash,
      roles: [ROLES.MEMBER],
    });

    const rawToken = generateRawToken();
    await this.authRepository.createEmailVerificationToken({
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + EMAIL_VERIFICATION_TOKEN_TTL_MS),
    });
    logger.info({ userId: user.id }, "User registered; email verification token issued");

    return {
      user: toUserResponseDto(user),
      // No email-sending provider is wired in yet (every provider in
      // modules/notification is still a skeleton) — echo the raw token
      // outside production so the flow is actually usable end to end
      // until one exists. Never echoed in production.
      ...(config.isProduction ? {} : { verificationToken: rawToken }),
    };
  }

  async login(dto: LoginDto, context: RequestContext): Promise<LoginResult> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }
    if (!user.isActive) {
      throw new ForbiddenError("This account has been deactivated");
    }

    const passwordIsValid = await verifyPassword(dto.password, user.passwordHash);
    if (!passwordIsValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const tokens = issueTokenPair({ sub: user.id, roles: user.roles });
    await this.persistRefreshToken(user.id, tokens.refreshToken, context);

    return { user: toUserResponseDto(user), tokens };
  }

  async logout(rawRefreshToken: string | undefined): Promise<void> {
    if (!rawRefreshToken) {
      return;
    }

    const record = await this.authRepository.findRefreshTokenByHash(hashToken(rawRefreshToken));
    if (record && !record.revokedAt) {
      await this.authRepository.revokeRefreshTokenById(record.id);
    }
  }

  async refresh(
    rawRefreshToken: string | undefined,
    context: RequestContext,
  ): Promise<LoginResult> {
    if (!rawRefreshToken) {
      throw new UnauthorizedError("Refresh token is required");
    }

    // Validates signature and expiry; throws UnauthorizedError itself if
    // either check fails.
    const payload = verifyRefreshToken(rawRefreshToken);

    const record = await this.authRepository.findRefreshTokenByHash(hashToken(rawRefreshToken));
    if (!record || record.userId !== payload.sub) {
      throw new UnauthorizedError("Refresh token is invalid");
    }

    if (record.revokedAt) {
      // A revoked token being presented again means it was already
      // rotated (or explicitly logged out) and is now being replayed —
      // the strongest available signal that it was stolen. Respond by
      // revoking every session for this user, not just this one token.
      await this.authRepository.revokeAllRefreshTokensForUser(record.userId);
      logger.warn(
        { userId: record.userId, tokenId: record.id },
        "Reuse of a revoked refresh token detected; all sessions for this user were revoked",
      );
      throw new UnauthorizedError("Refresh token has already been used");
    }

    if (record.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedError("Refresh token has expired");
    }

    const user = await this.userRepository.findById(record.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError("Account is no longer active");
    }

    const tokens = issueTokenPair({ sub: user.id, roles: user.roles });
    const newRecord = await this.persistRefreshToken(user.id, tokens.refreshToken, context);
    await this.authRepository.markRefreshTokenRotated(record.id, newRecord.id);

    return { user: toUserResponseDto(user), tokens };
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<void> {
    const tokenHash = hashToken(dto.token);
    const record = await this.authRepository.findEmailVerificationTokenByHash(tokenHash);

    if (!record || record.usedAt || record.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedError("Verification token is invalid or has expired");
    }

    await this.userRepository.update(record.userId, {
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    });
    await this.authRepository.markEmailVerificationTokenUsed(record.id);
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<ForgotPasswordResponseDto> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      // Same response whether or not the account exists — otherwise
      // this endpoint becomes a way to enumerate registered emails.
      return { message: GENERIC_FORGOT_PASSWORD_MESSAGE };
    }

    const rawToken = generateRawToken();
    await this.authRepository.createPasswordResetToken({
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS),
    });
    logger.info({ userId: user.id }, "Password reset requested");

    return {
      message: GENERIC_FORGOT_PASSWORD_MESSAGE,
      ...(config.isProduction ? {} : { resetToken: rawToken }),
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const tokenHash = hashToken(dto.token);
    const record = await this.authRepository.findPasswordResetTokenByHash(tokenHash);

    if (!record || record.usedAt || record.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedError("Reset token is invalid or has expired");
    }

    const passwordHash = await hashPassword(dto.password);
    await this.userRepository.update(record.userId, { passwordHash });
    await this.authRepository.markPasswordResetTokenUsed(record.id);
    // A password reset is a strong signal the previous password may
    // have been compromised — end every existing session, not just
    // this device's.
    await this.authRepository.revokeAllRefreshTokensForUser(record.userId);
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const currentPasswordIsValid = await verifyPassword(dto.currentPassword, user.passwordHash);
    if (!currentPasswordIsValid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    const passwordHash = await hashPassword(dto.newPassword);
    await this.userRepository.update(userId, { passwordHash });
    await this.authRepository.revokeAllRefreshTokensForUser(userId);
  }

  async getCurrentUser(userId: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return toUserResponseDto(user);
  }

  async listSessions(
    userId: string,
    currentRawRefreshToken: string | undefined,
  ): Promise<SessionResponseDto[]> {
    const records = await this.authRepository.findActiveSessionsByUserId(userId);
    const currentSessionId = await this.resolveSessionId(currentRawRefreshToken);
    return authMapper.toSessionResponseList(records, currentSessionId);
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const record = await this.authRepository.findRefreshTokenById(sessionId);
    if (!record || record.userId !== userId) {
      throw new NotFoundError("Session not found");
    }
    await this.authRepository.revokeRefreshTokenById(sessionId);
  }

  async revokeOtherSessions(
    userId: string,
    currentRawRefreshToken: string | undefined,
  ): Promise<void> {
    const currentSessionId = await this.resolveSessionId(currentRawRefreshToken);
    await this.authRepository.revokeAllRefreshTokensForUser(userId, currentSessionId ?? undefined);
  }

  private async persistRefreshToken(
    userId: string,
    rawRefreshToken: string,
    context: RequestContext,
  ): Promise<RefreshTokenRecord> {
    const payload = verifyRefreshToken(rawRefreshToken);
    return this.authRepository.createRefreshToken({
      userId,
      tokenHash: hashToken(rawRefreshToken),
      expiresAt: new Date(payload.exp * 1000),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });
  }

  private async resolveSessionId(rawRefreshToken: string | undefined): Promise<string | null> {
    if (!rawRefreshToken) {
      return null;
    }
    const record = await this.authRepository.findRefreshTokenByHash(hashToken(rawRefreshToken));
    return record?.id ?? null;
  }
}
