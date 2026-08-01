import type { updateBrandVisibilitySchema } from "../validation";
import type { z } from "zod";

export type UpdateBrandVisibilityDto = z.infer<typeof updateBrandVisibilitySchema>;
