import type { UserResponseDto } from "../../user";

/** What `/register`, `/login`, and `/refresh` all return in their
 * response body. Tokens are never included here — they travel
 * exclusively as httpOnly cookies (see `auth/utils/cookie.utils.ts`),
 * never as JSON a script on the page could read. */
export interface AuthResponseDto {
  user: UserResponseDto;
}

/** `/register` additionally echoes the raw verification token outside
 * production, since no email-sending provider is wired in yet (every
 * provider in `modules/notification` is still a skeleton) — see
 * `service/auth.service.ts`'s `register` method. */
export interface RegisterResponseDto extends AuthResponseDto {
  verificationToken?: string;
}
