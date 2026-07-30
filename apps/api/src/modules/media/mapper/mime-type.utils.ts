import { MEDIA_PURPOSE_MIME_TYPES } from "../constants";

import type { MediaPurpose } from "../constants";

export function getAllowedMimeTypes(purpose: MediaPurpose): readonly string[] {
  return MEDIA_PURPOSE_MIME_TYPES[purpose] ?? [];
}

export function isMimeTypeAllowedForPurpose(mimeType: string, purpose: MediaPurpose): boolean {
  return getAllowedMimeTypes(purpose).includes(mimeType);
}
