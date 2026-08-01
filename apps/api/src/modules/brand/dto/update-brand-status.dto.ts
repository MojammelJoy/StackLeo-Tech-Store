import type { updateBrandStatusSchema } from "../validation";
import type { z } from "zod";

export type UpdateBrandStatusDto = z.infer<typeof updateBrandStatusSchema>;
