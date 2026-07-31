import { clearAuthCookies, getRefreshTokenCookie, setAuthCookies } from "../../../auth";
import { HTTP_STATUS, sendSuccess } from "../../../common";
import { BadRequestError, UnauthorizedError } from "../../../errors";
import { asyncHandler } from "../../../utils";

import type { AuthenticatedUser } from "../../../auth";
import type {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from "../dto";
import type { RequestContext } from "../interfaces";
import type { AuthService } from "../service";
import type { Request } from "express";

function getRequestContext(req: Request): RequestContext {
  return {
    ipAddress: req.ip ?? null,
    userAgent: req.get("user-agent") ?? null,
  };
}

/** Reads the refresh token from its cookie first, falling back to the
 * request body — mirrors `auth/utils/token-extraction.utils.ts`'s
 * `extractAccessToken`, so both tokens support the same two transports
 * (browser cookie, or a non-browser client sending it explicitly). */
function extractRefreshToken(req: Request): string | undefined {
  const fromCookie = getRefreshTokenCookie(req);
  if (fromCookie) {
    return fromCookie;
  }

  const body: unknown = req.body;
  if (body && typeof body === "object" && "refreshToken" in body) {
    const value = (body as Record<string, unknown>).refreshToken;
    return typeof value === "string" ? value : undefined;
  }

  return undefined;
}

function requireAuthenticatedUser(req: Request): AuthenticatedUser {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required");
  }
  return req.user;
}

/**
 * Express handlers for every Authentication API endpoint. Each method is
 * an `asyncHandler`-wrapped arrow function (bound automatically, so
 * `routes/auth.routes.ts` can reference `authController.login` directly
 * without an extra `.bind(authController)`), and does only three things:
 * read the request, call one `AuthService` method, and send the
 * response — no business logic lives here.
 */
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = asyncHandler(async (req, res) => {
    const dto = req.body as RegisterDto;
    const result = await this.authService.register(dto);
    sendSuccess(res, result, { statusCode: HTTP_STATUS.CREATED });
  });

  login = asyncHandler(async (req, res) => {
    const dto = req.body as LoginDto;
    const { user, tokens } = await this.authService.login(dto, getRequestContext(req));
    setAuthCookies(res, tokens);
    sendSuccess(res, { user });
  });

  logout = asyncHandler(async (req, res) => {
    await this.authService.logout(extractRefreshToken(req));
    clearAuthCookies(res);
    sendSuccess(res, { message: "Logged out successfully" });
  });

  refresh = asyncHandler(async (req, res) => {
    const { user, tokens } = await this.authService.refresh(
      extractRefreshToken(req),
      getRequestContext(req),
    );
    setAuthCookies(res, tokens);
    sendSuccess(res, { user });
  });

  verifyEmail = asyncHandler(async (req, res) => {
    const dto = req.body as VerifyEmailDto;
    await this.authService.verifyEmail(dto);
    sendSuccess(res, { message: "Email verified successfully" });
  });

  forgotPassword = asyncHandler(async (req, res) => {
    const dto = req.body as ForgotPasswordDto;
    const result = await this.authService.forgotPassword(dto);
    sendSuccess(res, result);
  });

  resetPassword = asyncHandler(async (req, res) => {
    const dto = req.body as ResetPasswordDto;
    await this.authService.resetPassword(dto);
    sendSuccess(res, { message: "Password has been reset successfully" });
  });

  changePassword = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const dto = req.body as ChangePasswordDto;
    await this.authService.changePassword(actor.id, dto);
    sendSuccess(res, { message: "Password changed successfully" });
  });

  getCurrentUser = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const user = await this.authService.getCurrentUser(actor.id);
    sendSuccess(res, { user });
  });

  listSessions = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const sessions = await this.authService.listSessions(actor.id, extractRefreshToken(req));
    sendSuccess(res, { sessions });
  });

  revokeSession = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    const sessionId = req.params.sessionId;
    if (!sessionId) {
      throw new BadRequestError("Session id is required");
    }
    await this.authService.revokeSession(actor.id, sessionId);
    sendSuccess(res, { message: "Session revoked" });
  });

  revokeOtherSessions = asyncHandler(async (req, res) => {
    const actor = requireAuthenticatedUser(req);
    await this.authService.revokeOtherSessions(actor.id, extractRefreshToken(req));
    sendSuccess(res, { message: "Other sessions revoked" });
  });
}
