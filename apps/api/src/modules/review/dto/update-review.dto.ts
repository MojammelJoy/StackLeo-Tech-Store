import type { updateReviewSchema } from "../validation";
import type { z } from "zod";

export type UpdateReviewDto = z.infer<typeof updateReviewSchema>;
