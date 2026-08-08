import type { updateUserRolesSchema } from "../validation";
import type { z } from "zod";

export type UpdateUserRolesDto = z.infer<typeof updateUserRolesSchema>;
