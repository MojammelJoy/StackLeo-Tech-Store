import type { createReviewSchema } from "../validation";
import type { z } from "zod";

export type CreateReviewDto = z.infer<typeof createReviewSchema>;
