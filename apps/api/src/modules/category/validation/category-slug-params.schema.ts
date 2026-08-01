import { z } from "zod";

export const categorySlugParamsSchema = z.object({
  slug: z.string().min(1),
});
