import type { updateBrandLogoSchema } from "../validation";
import type { z } from "zod";

export type UpdateBrandLogoDto = z.infer<typeof updateBrandLogoSchema>;
