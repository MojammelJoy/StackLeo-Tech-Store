import type { autocompleteQuerySchema } from "../validation";
import type { z } from "zod";

export type AutocompleteQueryDto = z.infer<typeof autocompleteQuerySchema>;
