import type { replaceProductSpecificationsSchema } from "../validation";
import type { z } from "zod";

export type ReplaceProductSpecificationsDto = z.infer<typeof replaceProductSpecificationsSchema>;
