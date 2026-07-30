import type { createBrandSchema } from "../validation";
import type { z } from "zod";

export type CreateBrandDto = z.infer<typeof createBrandSchema>;
