/** The "Get unread notification count" deliverable — a single efficient
 * aggregate, distinct from a paginated listing. */
export interface UnreadCountResponseDto {
  count: number;
}
