import type { updateUserStatusSchema } from "../validation";
import type { z } from "zod";

export type UpdateUserStatusDto = z.infer<typeof updateUserStatusSchema>;
