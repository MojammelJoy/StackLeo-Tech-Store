import { z } from "zod";

export const productVariantParamsSchema = z.object({
  id: z.string().min(1),
  variantId: z.string().min(1),
});
