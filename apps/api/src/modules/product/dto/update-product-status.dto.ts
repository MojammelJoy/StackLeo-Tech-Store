import type { updateProductStatusSchema } from "../validation";
import type { z } from "zod";

export type UpdateProductStatusDto = z.infer<typeof updateProductStatusSchema>;
