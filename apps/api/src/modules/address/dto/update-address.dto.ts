import type { updateAddressSchema } from "../validation";
import type { z } from "zod";

export type UpdateAddressDto = z.infer<typeof updateAddressSchema>;
