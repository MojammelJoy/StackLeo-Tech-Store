import type { updateCategoryVisibilitySchema } from "../validation";
import type { z } from "zod";

export type UpdateCategoryVisibilityDto = z.infer<typeof updateCategoryVisibilitySchema>;
