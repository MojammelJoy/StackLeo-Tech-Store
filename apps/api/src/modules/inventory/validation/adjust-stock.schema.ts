import { z } from "zod";

import { config } from "../../../config";
import { INVENTORY_MOVEMENT_REASON_MAX_LENGTH } from "../constants";
import { nonNegativeQuantitySchema } from "../schemas";

/**
 * `quantity` here is the new *absolute* stock level (a physical-count
 * correction), not a delta — distinct from `increase`/`decrease`, which
 * both take a magnitude to apply on top of the current quantity. Mirrors
 * `modules/inventory`'s existing `createInventoryMovementSchema`: a
 * reason is required in production (a real compliance concern for a
 * manual correction once live) but optional in development/test, where
 * requiring it is just friction.
 */
export const adjustStockSchema = z
  .object({
    quantity: nonNegativeQuantitySchema,
    reason: z.string().trim().max(INVENTORY_MOVEMENT_REASON_MAX_LENGTH).optional(),
  })
  .refine((data) => !config.isProduction || Boolean(data.reason), {
    message: "A reason is required for manual stock adjustments in production",
    path: ["reason"],
  });
