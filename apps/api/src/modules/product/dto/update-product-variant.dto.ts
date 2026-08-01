import type { updateProductVariantSchema } from "../validation";
import type { z } from "zod";

export type UpdateProductVariantDto = z.infer<typeof updateProductVariantSchema>;
