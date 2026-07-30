import type { createInventoryMovementSchema } from "../validation";
import type { z } from "zod";

export type CreateInventoryMovementDto = z.infer<typeof createInventoryMovementSchema>;
