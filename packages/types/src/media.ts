export type MediaPurpose =
  | "product_image"
  | "gallery_image"
  | "brand_logo"
  | "category_image"
  | "user_avatar"
  | "pdf_manual"
  | "warranty_document"
  | "video";

export type MediaOwnerType = "product" | "brand" | "category" | "user";
export type MediaStatus = "pending" | "ready" | "failed" | "deleted";
export type StorageProviderName = "cloudinary" | "local";

/**
 * Mirrors apps/api's `MediaAssetResponseDto` exactly
 * (apps/api/src/modules/media/dto/media-asset-response.dto.ts) — what
 * `GET /api/v1/media/owner/:ownerType/:ownerId` returns per asset. There
 * is no "primary image" concept on this DTO or the backend it mirrors —
 * callers choose how to order/display the array themselves (e.g. first
 * item as the hero image), never a field this type invents.
 */
export interface MediaAsset {
  id: string;
  fileName: string;
  fileExtension: string;
  mimeType: string;
  sizeBytes: number;
  formattedSize: string;
  url: string;
  provider: StorageProviderName;
  purpose: MediaPurpose;
  ownerType: MediaOwnerType | null;
  ownerId: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
  status: MediaStatus;
  createdAt: string;
  updatedAt: string;
}

/** What `GET /media/owner/:ownerType/:ownerId` returns under `data`. */
export interface MediaByOwnerResponse {
  assets: MediaAsset[];
}
