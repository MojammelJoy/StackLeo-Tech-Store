import type { createMediaAssetSchema } from "../validation";
import type { z } from "zod";

export type CreateMediaAssetDto = z.infer<typeof createMediaAssetSchema>;
