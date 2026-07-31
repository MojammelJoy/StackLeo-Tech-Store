import type { loginSchema } from "../validation";
import type { z } from "zod";

export type LoginDto = z.infer<typeof loginSchema>;
