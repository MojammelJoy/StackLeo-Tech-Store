import { z } from "zod";

import { SEARCH_KEYWORD_MAX_LENGTH, SEARCH_KEYWORD_MIN_LENGTH } from "../constants";

export const keywordSchema = z
  .string()
  .trim()
  .min(SEARCH_KEYWORD_MIN_LENGTH)
  .max(SEARCH_KEYWORD_MAX_LENGTH);
