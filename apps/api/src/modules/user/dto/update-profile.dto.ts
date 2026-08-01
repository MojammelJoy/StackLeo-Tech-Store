import type { updateProfileSchema } from "../validation";
import type { z } from "zod";

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
