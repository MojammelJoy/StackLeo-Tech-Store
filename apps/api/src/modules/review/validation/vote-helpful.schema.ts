import { z } from "zod";

export const voteHelpfulSchema = z.object({
  helpful: z.boolean(),
});
