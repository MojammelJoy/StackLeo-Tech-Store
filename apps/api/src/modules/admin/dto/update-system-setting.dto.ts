import type { updateSystemSettingSchema } from "../validation";
import type { z } from "zod";

export type UpdateSystemSettingDto = z.infer<typeof updateSystemSettingSchema>;
