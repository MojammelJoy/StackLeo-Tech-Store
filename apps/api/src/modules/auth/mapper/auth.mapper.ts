import type { SessionResponseDto } from "../dto";
import type { RefreshTokenRecord } from "../types";

function toSessionResponseDto(
  record: RefreshTokenRecord,
  currentSessionId: string | null,
): SessionResponseDto {
  return {
    id: record.id,
    ipAddress: record.ipAddress,
    userAgent: record.userAgent,
    createdAt: record.createdAt,
    expiresAt: record.expiresAt,
    isCurrent: record.id === currentSessionId,
  };
}

function toSessionResponseList(
  records: RefreshTokenRecord[],
  currentSessionId: string | null,
): SessionResponseDto[] {
  return records.map((record) => toSessionResponseDto(record, currentSessionId));
}

/** The only place a `RefreshTokenRecord` is converted to its public
 * session shape — callers map through this instead of building the DTO
 * by hand, so `tokenHash` can never leak by accident. */
export const authMapper = { toSessionResponseDto, toSessionResponseList };
