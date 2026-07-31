import { randomUUID } from "node:crypto";

/** A deterministic-shape, unique-per-call id for test fixtures — prefixed
 * so failures are easy to trace back to what kind of entity created
 * them (e.g. `"user_3f2a..."`). */
export function randomTestId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}

/** A unique, obviously-fake email address for test fixtures — always
 * under `example.test`, never a domain that could resolve to a real
 * mailbox. */
export function randomTestEmail(): string {
  return `${randomUUID()}@example.test`;
}
