import type { updateBrandSchema } from "../validation";
import type { z } from "zod";

export type UpdateBrandDto = z.infer<typeof updateBrandSchema>;
