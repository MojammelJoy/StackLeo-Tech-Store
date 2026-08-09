import { z } from "zod";

import type {
  AuthenticatedUser,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
} from "@stackleo/types";

/** Length bounds mirror apps/api's `USER_PASSWORD_MIN_LENGTH`/
 * `USER_PASSWORD_MAX_LENGTH` (apps/api/src/modules/user/constants) — the
 * actual enforced registration policy, not a guessed one. */
const AUTH_PASSWORD_MIN_LENGTH = 8;
const AUTH_PASSWORD_MAX_LENGTH = 72;

/** Mirrors apps/api's shared `emailSchema`
 * (apps/api/src/modules/auth/schemas/email.schema.ts). */
const authEmailSchema = z.string().trim().toLowerCase().email("Must be a valid email address");

/**
 * Mirrors apps/api's `loginSchema` exactly: no length bounds on the
 * password field — enforcing today's registration policy again at login
 * would reject a real, correct password if that policy ever tightens
 * after the account was created (see the backend schema's own comment).
 */
export const loginSchema = z.object({
  email: authEmailSchema,
  password: z.string().min(1, "Password is required"),
}) satisfies z.ZodType<LoginRequest>;

/** Mirrors apps/api's `registerSchema`/`passwordSchema`. */
export const registerSchema = z.object({
  email: authEmailSchema,
  password: z
    .string()
    .min(
      AUTH_PASSWORD_MIN_LENGTH,
      `Password must be at least ${AUTH_PASSWORD_MIN_LENGTH} characters`,
    )
    .max(
      AUTH_PASSWORD_MAX_LENGTH,
      `Password must be at most ${AUTH_PASSWORD_MAX_LENGTH} characters`,
    ),
}) satisfies z.ZodType<RegisterRequest>;

const authenticatedUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  roles: z.array(z.string()),
  isActive: z.boolean(),
  isEmailVerified: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
}) satisfies z.ZodType<AuthenticatedUser>;

/** Validates the `data` payload of `/register`, `/login`, `/refresh`, and
 * `/me` responses before it reaches the UI. */
export const authResponseSchema = z.object({
  user: authenticatedUserSchema,
}) satisfies z.ZodType<AuthResponse>;
