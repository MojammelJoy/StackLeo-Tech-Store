import type { SessionSummary } from "../interfaces";

/** Reuses `SessionSummary` verbatim as the wire shape — there is nothing
 * internal about it left to hide. */
export type SessionResponseDto = SessionSummary;
