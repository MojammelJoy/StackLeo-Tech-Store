import type { addOrderItemSchema } from "../validation";
import type { z } from "zod";

export type AddOrderItemDto = z.infer<typeof addOrderItemSchema>;
