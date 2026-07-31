/** Byte length of every random, opaque token this module generates
 * (email verification, password reset) before hex-encoding — 32 bytes
 * (256 bits) is far beyond brute-forceable. */
export const RAW_TOKEN_BYTE_LENGTH = 32;

export const EMAIL_VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

/** Deliberately much shorter than email verification — a password reset
 * token grants control of the account outright, so it should be far
 * less useful if intercepted after the fact. */
export const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

/**
 * Returned by `/forgot-password`/`/register` regardless of whether the
 * account actually exists — revealing that would let a caller enumerate
 * registered email addresses one guess at a time.
 */
export const GENERIC_FORGOT_PASSWORD_MESSAGE =
  "If an account with that email exists, a password reset link has been sent.";
