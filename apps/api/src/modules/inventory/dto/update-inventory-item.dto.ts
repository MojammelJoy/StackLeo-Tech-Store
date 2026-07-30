import type { updateInventoryItemSchema } from "../validation";
import type { z } from "zod";

export type UpdateInventoryItemDto = z.infer<typeof updateInventoryItemSchema>;
