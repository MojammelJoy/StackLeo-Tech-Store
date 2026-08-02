import type { uploadMediaFieldsSchema } from "../validation";
import type { z } from "zod";

export type UploadMediaFieldsDto = z.infer<typeof uploadMediaFieldsSchema>;
