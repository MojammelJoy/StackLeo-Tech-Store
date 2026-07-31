import { createHash, randomBytes } from "node:crypto";

import { RAW_TOKEN_BYTE_LENGTH } from "../constants";

/** A high-entropy, hex-encoded token for email verification/password
 * reset links — sent to the caller once and never stored raw (see
 * `hashToken`). */
export function generateRawToken(): string {
  return randomBytes(RAW_TOKEN_BYTE_LENGTH).toString("hex");
}

/**
 * Deterministic SHA-256 digest used to look up a stored refresh/
 * verification/reset token by its raw value. Deliberately not bcrypt:
 * bcrypt is for low-entropy secrets (passwords) where slow, salted
 * hashing defends against offline guessing; every token this function
 * hashes is already a cryptographically random, effectively unguessable
 * value (a signed JWT or 32 random bytes) — the only property that
 * matters here is that a database read alone never discloses a token a
 * caller could replay, which a fast, deterministic hash already
 * provides.
 */
export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}
