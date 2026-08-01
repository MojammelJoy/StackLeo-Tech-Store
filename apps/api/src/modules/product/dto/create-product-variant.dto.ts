import type { createProductVariantSchema } from "../validation";
import type { z } from "zod";

export type CreateProductVariantDto = z.infer<typeof createProductVariantSchema>;
