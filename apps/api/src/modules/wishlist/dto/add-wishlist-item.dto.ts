import type { addWishlistItemSchema } from "../validation";
import type { z } from "zod";

export type AddWishlistItemDto = z.infer<typeof addWishlistItemSchema>;
