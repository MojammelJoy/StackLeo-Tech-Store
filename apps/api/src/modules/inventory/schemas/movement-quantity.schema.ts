import { z } from "zod";

/**
 * A movement's magnitude — always positive; direction is implied by
 * `InventoryMovementType`, not by the sign of `quantity`.
 */
export const positiveQuantitySchema = z.number().int().positive();
