import { MEDIA_PURPOSE_MAX_SIZE_BYTES } from "../constants";

import { isMimeTypeAllowedForPurpose } from "./mime-type.utils";

import type { MediaPurpose } from "../constants";
import type { FileMetadata } from "../types";

export interface FileValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Reusable, standalone check for "is this file acceptable for this
 * purpose" — offered for any future caller (a provider re-checking
 * before upload, logic outside this foundation) that needs the same
 * check `validation/create-media-asset.schema.ts`'s Zod refinements
 * already apply at the API boundary. Deliberately not called by that
 * schema itself, so `validation/` never depends on `mapper/` (the wrong
 * direction for this module's layering) — both read the same
 * `constants/` data independently instead.
 */
export function validateFileForPurpose(
  file: FileMetadata,
  purpose: MediaPurpose,
): FileValidationResult {
  const errors: string[] = [];

  if (!isMimeTypeAllowedForPurpose(file.mimeType, purpose)) {
    errors.push(`MIME type "${file.mimeType}" is not allowed for purpose "${purpose}"`);
  }

  const maxSizeBytes = MEDIA_PURPOSE_MAX_SIZE_BYTES[purpose];
  if (maxSizeBytes !== undefined && file.sizeBytes > maxSizeBytes) {
    errors.push(
      `File size ${file.sizeBytes} exceeds the ${maxSizeBytes}-byte limit for purpose "${purpose}"`,
    );
  }

  return { valid: errors.length === 0, errors };
}
