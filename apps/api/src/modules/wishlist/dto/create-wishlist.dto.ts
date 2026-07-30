import type { createWishlistSchema } from "../validation";
import type { z } from "zod";

export type CreateWishlistDto = z.infer<typeof createWishlistSchema>;
