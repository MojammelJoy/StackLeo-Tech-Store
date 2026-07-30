import type { createCategorySchema } from "../validation";
import type { z } from "zod";

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
