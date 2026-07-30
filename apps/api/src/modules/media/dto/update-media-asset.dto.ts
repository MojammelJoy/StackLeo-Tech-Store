import type { updateMediaAssetSchema } from "../validation";
import type { z } from "zod";

export type UpdateMediaAssetDto = z.infer<typeof updateMediaAssetSchema>;
