import { authResponseSchema } from "@stackleo/validation";

import { apiRequest, ApiError } from "./client";

import type {
  ApiSuccessResponse,
  AuthenticatedUser,
  LoginRequest,
  RegisterRequest,
} from "@stackleo/types";

/**
 * Creates an account. Deliberately does **not** authenticate the caller —
 * `POST /register` never sets the auth cookies (only `/login` and
 * `/refresh` do; confirmed in apps/api's `AuthController`). Callers must
 * direct the user to sign in afterward.
 */
export async function register(input: RegisterRequest): Promise<AuthenticatedUser> {
  const response = await apiRequest<ApiSuccessResponse<unknown>>("/api/v1/auth/register", {
    method: "POST",
    body: input,
  });
  return authResponseSchema.parse(response.data).user;
}

/** Sets the httpOnly `access_token`/`refresh_token` cookies as a side
 * effect of the response — this client never touches them directly. */
export async function login(input: LoginRequest): Promise<AuthenticatedUser> {
  const response = await apiRequest<ApiSuccessResponse<unknown>>("/api/v1/auth/login", {
    method: "POST",
    body: input,
  });
  return authResponseSchema.parse(response.data).user;
}

/** Clears the auth cookies server-side. Takes no arguments — the refresh
 * token travels via cookie, never through this client's JS. */
export async function logout(): Promise<void> {
  await apiRequest("/api/v1/auth/logout", { method: "POST" });
}

/**
 * Rotates the session using the httpOnly refresh-token cookie and returns
 * the typed current user — for direct/manual use (e.g. a future "your
 * session expired" UI). `client.ts`'s `apiRequest` performs the same
 * `POST /refresh` call automatically on a 401 (silent refresh + retry),
 * but does so via its own minimal, unvalidated internal call rather than
 * this function, specifically to avoid `client.ts` importing from this
 * module — `auth.ts` already imports `apiRequest` from `client.ts`, so
 * the reverse import would be circular.
 */
export async function refreshSession(): Promise<AuthenticatedUser> {
  const response = await apiRequest<ApiSuccessResponse<unknown>>("/api/v1/auth/refresh", {
    method: "POST",
  });
  return authResponseSchema.parse(response.data).user;
}

/**
 * Resolves the current session, or `null` for "not signed in" — a 401
 * from `GET /me` is the expected, unauthenticated case (the route
 * requires `authenticate`), not a failure to surface as an error.
 */
export async function getCurrentUser(signal?: AbortSignal): Promise<AuthenticatedUser | null> {
  try {
    const response = await apiRequest<ApiSuccessResponse<unknown>>("/api/v1/auth/me", { signal });
    return authResponseSchema.parse(response.data).user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }
    throw error;
  }
}

/**
 * Turns an auth API failure into a message safe to show a customer.
 * `ApiError`'s 4xx messages are always backend-curated, user-facing text
 * (see apps/api's `AppError` subclasses — "Invalid email or password",
 * "An account with that email already exists", etc.); anything else
 * (network failure, 5xx) could be an internal error message never meant
 * for a customer, so it gets a generic fallback instead.
 */
export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
