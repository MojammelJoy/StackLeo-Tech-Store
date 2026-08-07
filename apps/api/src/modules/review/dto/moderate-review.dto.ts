import type { moderateReviewSchema } from "../validation";
import type { z } from "zod";

export type ModerateReviewDto = z.infer<typeof moderateReviewSchema>;
