import type { updateProductSchema } from "../validation";
import type { z } from "zod";

export type UpdateProductDto = z.infer<typeof updateProductSchema>;
