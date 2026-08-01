import { z } from "zod";

import { INVENTORY_MOVEMENT_REASON_MAX_LENGTH } from "../constants";

import { positiveQuantitySchema } from "./movement-quantity.schema";

/**
 * The shared shape of `increase`/`decrease`/`reserve`/`release`'s
 * request body — all four are "move this many units, optionally with a
 * reason" today. Kept as one reusable schema rather than four
 * hand-copied ones so the shape only has to change in one place;
 * `validation/*.schema.ts` re-exports it under each operation's own
 * name so each can still diverge independently later without touching
 * the others.
 */
export const movementRequestSchema = z.object({
  quantity: positiveQuantitySchema,
  reason: z.string().trim().max(INVENTORY_MOVEMENT_REASON_MAX_LENGTH).optional(),
});
