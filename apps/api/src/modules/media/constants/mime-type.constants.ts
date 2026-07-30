import { MEDIA_PURPOSES } from "./media.constants";

export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
export const DOCUMENT_MIME_TYPES = ["application/pdf"] as const;
export const VIDEO_MIME_TYPES = ["video/mp4", "video/webm", "video/quicktime"] as const;

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_DOCUMENT_SIZE_BYTES = 25 * 1024 * 1024;
export const MAX_VIDEO_SIZE_BYTES = 500 * 1024 * 1024;

/**
 * Single source of truth for "which MIME types are acceptable for this
 * purpose" — read directly by both `validation/create-media-asset.schema.ts`
 * (at the API boundary) and `mapper/mime-type.utils.ts` (as a standalone,
 * reusable check for any other future caller). Neither imports the
 * other; both read this instead, so the two never have separate lists
 * to fall out of sync.
 */
export const MEDIA_PURPOSE_MIME_TYPES: Record<string, readonly string[]> = {
  [MEDIA_PURPOSES.PRODUCT_IMAGE]: IMAGE_MIME_TYPES,
  [MEDIA_PURPOSES.GALLERY_IMAGE]: IMAGE_MIME_TYPES,
  [MEDIA_PURPOSES.BRAND_LOGO]: IMAGE_MIME_TYPES,
  [MEDIA_PURPOSES.CATEGORY_IMAGE]: IMAGE_MIME_TYPES,
  [MEDIA_PURPOSES.USER_AVATAR]: IMAGE_MIME_TYPES,
  [MEDIA_PURPOSES.PDF_MANUAL]: DOCUMENT_MIME_TYPES,
  [MEDIA_PURPOSES.WARRANTY_DOCUMENT]: DOCUMENT_MIME_TYPES,
  [MEDIA_PURPOSES.VIDEO]: VIDEO_MIME_TYPES,
};

/** Same rationale as `MEDIA_PURPOSE_MIME_TYPES` above. */
export const MEDIA_PURPOSE_MAX_SIZE_BYTES: Record<string, number> = {
  [MEDIA_PURPOSES.PRODUCT_IMAGE]: MAX_IMAGE_SIZE_BYTES,
  [MEDIA_PURPOSES.GALLERY_IMAGE]: MAX_IMAGE_SIZE_BYTES,
  [MEDIA_PURPOSES.BRAND_LOGO]: MAX_IMAGE_SIZE_BYTES,
  [MEDIA_PURPOSES.CATEGORY_IMAGE]: MAX_IMAGE_SIZE_BYTES,
  [MEDIA_PURPOSES.USER_AVATAR]: MAX_IMAGE_SIZE_BYTES,
  [MEDIA_PURPOSES.PDF_MANUAL]: MAX_DOCUMENT_SIZE_BYTES,
  [MEDIA_PURPOSES.WARRANTY_DOCUMENT]: MAX_DOCUMENT_SIZE_BYTES,
  [MEDIA_PURPOSES.VIDEO]: MAX_VIDEO_SIZE_BYTES,
};
