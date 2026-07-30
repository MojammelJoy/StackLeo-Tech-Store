import { z } from "zod";

import { ORDER_NOTES_MAX_LENGTH } from "../constants";

export const notesSchema = z.string().max(ORDER_NOTES_MAX_LENGTH);
