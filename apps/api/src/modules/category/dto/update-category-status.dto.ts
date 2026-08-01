import type { updateCategoryStatusSchema } from "../validation";
import type { z } from "zod";

export type UpdateCategoryStatusDto = z.infer<typeof updateCategoryStatusSchema>;
