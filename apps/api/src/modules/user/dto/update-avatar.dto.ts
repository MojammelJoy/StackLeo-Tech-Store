import type { updateAvatarSchema } from "../validation";
import type { z } from "zod";

export type UpdateAvatarDto = z.infer<typeof updateAvatarSchema>;
