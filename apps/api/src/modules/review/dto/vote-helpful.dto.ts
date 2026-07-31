import type { voteHelpfulSchema } from "../validation";
import type { z } from "zod";

export type VoteHelpfulDto = z.infer<typeof voteHelpfulSchema>;
