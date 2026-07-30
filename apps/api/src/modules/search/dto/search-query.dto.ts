import type { searchQuerySchema } from "../validation";
import type { z } from "zod";

export type SearchQueryDto = z.infer<typeof searchQuerySchema>;
