/**
 * The Authentication API: register, login, logout, refresh (with
 * rotation + reuse detection), email verification, forgot/reset/change
 * password, current user, and session management — a real, working
 * feature, not reusable-infrastructure-only scaffolding. Built on
 * `auth/` (JWT signing/verification, password hashing, cookie
 * helpers, authenticate/authorize middleware), `modules/user` (account
 * persistence), and `modules/rbac` (the default role assigned at
 * registration).
 */
export {
  EMAIL_VERIFICATION_TOKEN_TTL_MS,
  GENERIC_FORGOT_PASSWORD_MESSAGE,
  PASSWORD_RESET_TOKEN_TTL_MS,
  RAW_TOKEN_BYTE_LENGTH,
} from "./constants";

export type {
  CreatePasswordResetTokenInput,
  CreateRefreshTokenInput,
  CreateEmailVerificationTokenInput,
  EmailVerificationTokenRecord,
  PasswordResetTokenRecord,
  RefreshTokenRecord,
} from "./types";

export type { RequestContext, SessionSummary } from "./interfaces";

export { emailSchema, passwordSchema, rawTokenSchema } from "./schemas";

export {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  sessionIdParamsSchema,
  verifyEmailSchema,
} from "./validation";
export type {
  AuthResponseDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ForgotPasswordResponseDto,
  LoginDto,
  MessageResponseDto,
  RegisterDto,
  RegisterResponseDto,
  ResetPasswordDto,
  SessionResponseDto,
  VerifyEmailDto,
} from "./dto";

export { authMapper } from "./mapper";

export { generateRawToken, hashToken } from "./utils";

export { AuthPrismaRepository } from "./repository";
export type { AuthRepository } from "./repository";

export { AuthService } from "./service";
export type { LoginResult } from "./service";

export { AuthController } from "./controller";

export { authRouter } from "./routes";
