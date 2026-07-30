import type { updateCategorySchema } from "../validation";
import type { z } from "zod";

export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;
