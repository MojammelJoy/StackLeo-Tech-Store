import type { createProductSchema } from "../validation";
import type { z } from "zod";

export type CreateProductDto = z.infer<typeof createProductSchema>;
