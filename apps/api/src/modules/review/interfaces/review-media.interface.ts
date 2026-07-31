import type { ReviewMediaType } from "../constants";

/**
 * A single image/video attached to a review. `mediaId` is a bare
 * FK-shaped string into `modules/media`'s asset store — this module
 * never imports `modules/media` directly (the same cross-module
 * decoupling every foundation in this app follows), so a review only
 * ever knows *which* asset it references and how to render it, never
 * the asset's own metadata.
 */
export interface ReviewMediaItem {
  mediaId: string;
  type: ReviewMediaType;
}
