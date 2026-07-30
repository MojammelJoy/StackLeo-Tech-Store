import type { AuthenticatedUser } from "./auth.types";

/**
 * Augments Express's Request type with the field `authenticate`/
 * `extractCurrentUser` attach. Ambient — no runtime code; picked up
 * automatically by TS because it is included in the program via `src`.
 * Mirrors the existing `req.id` augmentation in
 * `src/types/express.d.ts`, scoped to the authenticated user instead of
 * request tracing.
 */
export {};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
