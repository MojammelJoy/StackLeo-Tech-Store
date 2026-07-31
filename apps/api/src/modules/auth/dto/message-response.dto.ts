/** A plain confirmation message — what `/logout`, `/verify-email`,
 * `/reset-password`, `/change-password`, and the session-revocation
 * endpoints return; none of them have any other data worth returning. */
export interface MessageResponseDto {
  message: string;
}
