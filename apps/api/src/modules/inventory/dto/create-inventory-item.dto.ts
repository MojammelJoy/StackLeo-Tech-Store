import type { createInventoryItemSchema } from "../validation";
import type { z } from "zod";

export type CreateInventoryItemDto = z.infer<typeof createInventoryItemSchema>;
