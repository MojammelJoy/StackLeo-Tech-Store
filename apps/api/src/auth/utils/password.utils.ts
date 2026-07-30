import bcrypt from "bcryptjs";

import { BCRYPT_SALT_ROUNDS } from "../constants";

/**
 * Hashes a plaintext password for storage. Never store or log the
 * plaintext value this receives.
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return bcrypt.hash(plainPassword, BCRYPT_SALT_ROUNDS);
}

/**
 * Compares a plaintext password against a previously hashed one.
 * Constant-time by virtue of bcrypt itself — never compare hashes with
 * `===`.
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}
