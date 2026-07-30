import type { addCartItemSchema } from "../validation";
import type { z } from "zod";

export type AddCartItemDto = z.infer<typeof addCartItemSchema>;
