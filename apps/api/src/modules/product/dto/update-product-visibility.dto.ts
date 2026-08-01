import type { updateProductVisibilitySchema } from "../validation";
import type { z } from "zod";

export type UpdateProductVisibilityDto = z.infer<typeof updateProductVisibilitySchema>;
