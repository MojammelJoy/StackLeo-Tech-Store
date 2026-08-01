import { z } from "zod";

export const brandSlugParamsSchema = z.object({
  slug: z.string().min(1),
});
