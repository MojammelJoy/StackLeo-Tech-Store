import type { updateWishlistItemSchema } from "../validation";
import type { z } from "zod";

export type UpdateWishlistItemDto = z.infer<typeof updateWishlistItemSchema>;
