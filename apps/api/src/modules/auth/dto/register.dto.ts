import type { registerSchema } from "../validation";
import type { z } from "zod";

export type RegisterDto = z.infer<typeof registerSchema>;
