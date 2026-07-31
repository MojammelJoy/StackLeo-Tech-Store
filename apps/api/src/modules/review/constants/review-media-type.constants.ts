/** What kind of asset a `ReviewMediaItem` (see
 * `interfaces/review-media.interface.ts`) points at. */
export const REVIEW_MEDIA_TYPES = {
  IMAGE: "image",
  VIDEO: "video",
} as const;

export type ReviewMediaType = (typeof REVIEW_MEDIA_TYPES)[keyof typeof REVIEW_MEDIA_TYPES];
