import { z } from "zod";

import { config } from "../../../config";
import { INVENTORY_MOVEMENT_REASON_MAX_LENGTH, INVENTORY_MOVEMENT_TYPES } from "../constants";
import { positiveQuantitySchema } from "../schemas";

/**
 * Requires `reason` for manual `ADJUSTMENT` movements in production —
 * the same prod-vs-dev split `modules/brand`'s URL schema and
 * `database/prisma/client.ts` already use elsewhere in this app. An
 * audit trail for manual stock corrections is a real compliance concern
 * once live; requiring it during local development/testing is just
 * friction. `STOCK_IN`/`STOCK_OUT`/`RESERVATION`/`RELEASE` are expected
 * to originate from traceable system events, so they aren't held to
 * this rule.
 */
export const createInventoryMovementSchema = z
  .object({
    inventoryItemId: z.string().min(1),
    type: z.enum([
      INVENTORY_MOVEMENT_TYPES.STOCK_IN,
      INVENTORY_MOVEMENT_TYPES.STOCK_OUT,
      INVENTORY_MOVEMENT_TYPES.RESERVATION,
      INVENTORY_MOVEMENT_TYPES.RELEASE,
      INVENTORY_MOVEMENT_TYPES.ADJUSTMENT,
    ]),
    quantity: positiveQuantitySchema,
    reason: z.string().max(INVENTORY_MOVEMENT_REASON_MAX_LENGTH).optional(),
  })
  .refine(
    (data) =>
      data.type !== INVENTORY_MOVEMENT_TYPES.ADJUSTMENT ||
      !config.isProduction ||
      Boolean(data.reason),
    {
      message: "A reason is required for manual adjustments in production",
      path: ["reason"],
    },
  );
