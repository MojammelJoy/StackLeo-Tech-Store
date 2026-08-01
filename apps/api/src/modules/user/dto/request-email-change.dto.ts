import type { requestEmailChangeSchema } from "../validation";
import type { z } from "zod";

export type RequestEmailChangeDto = z.infer<typeof requestEmailChangeSchema>;

/** `emailChangeToken` is only ever present outside production, for the
 * same reason `modules/auth`'s `RegisterResponseDto.verificationToken`
 * is — no email-sending provider is wired in yet. */
export interface RequestEmailChangeResponseDto {
  message: string;
  emailChangeToken?: string;
}
