import { z } from "zod";

/** Trims and lower-cases before the format check, matching how
 * `modules/user`'s `UserPrismaRepository` normalizes email on every
 * read/write — a client submitting mixed-case/whitespace-padded email
 * still resolves to the same account. */
export const emailSchema = z.string().trim().toLowerCase().email("Must be a valid email address");
