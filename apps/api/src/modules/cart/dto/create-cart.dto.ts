import type { createCartSchema } from "../validation";
import type { z } from "zod";

export type CreateCartDto = z.infer<typeof createCartSchema>;
