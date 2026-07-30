import type { updateCartItemSchema } from "../validation";
import type { z } from "zod";

export type UpdateCartItemDto = z.infer<typeof updateCartItemSchema>;
