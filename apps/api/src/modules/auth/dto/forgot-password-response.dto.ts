/** Always the same generic `message` regardless of whether the account
 * exists — see `constants/auth.constants.ts`'s
 * `GENERIC_FORGOT_PASSWORD_MESSAGE`. `resetToken` is only ever present
 * outside production, for the same reason `RegisterResponseDto.verificationToken` is. */
export interface ForgotPasswordResponseDto {
  message: string;
  resetToken?: string;
}
