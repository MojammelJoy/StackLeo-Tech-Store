import { createHash, randomBytes } from "node:crypto";

const RAW_TOKEN_BYTE_LENGTH = 32;

/**
 * A high-entropy, hex-encoded token for the email-change confirmation
 * link — sent to the caller once and never stored raw (see
 * `hashToken`). Deliberately a local mirror of `modules/auth`'s own
 * `generateRawToken`/`hashToken` rather than an import: `modules/user`
 * only takes a *value*-level dependency on `modules/auth` in
 * `routes/user.routes.ts` (constructing `AuthService`), and duplicating
 * two one-line crypto helpers is cheaper than widening that edge.
 */
export function generateRawToken(): string {
  return randomBytes(RAW_TOKEN_BYTE_LENGTH).toString("hex");
}

/** Deterministic SHA-256 digest used to look up a stored email-change
 * token by its raw value — see `modules/auth`'s `hashToken` for why a
 * fast, deterministic hash (rather than bcrypt) is correct here. */
export function hashToken(rawToken: string): string {
  return createHash("sha256").update(rawToken).digest("hex");
}
