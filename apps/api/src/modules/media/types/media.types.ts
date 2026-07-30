import type { MediaOwnerType, MediaPurpose, MediaStatus, StorageProviderName } from "../constants";

/**
 * The persisted MediaAsset domain entity. Not a Prisma-generated type —
 * no `MediaAsset` model exists in `prisma/schema.prisma` yet (out of
 * scope for this foundation). `ownerType`/`ownerId` are bare
 * foreign-key-shaped fields, not a dependency on the product/brand/
 * category/user modules — none of those enforce this relationship
 * either, since none of them have Prisma models yet.
 */
export interface MediaAsset {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  provider: StorageProviderName;
  /** Provider-specific reference — e.g. a Cloudinary `public_id`, or a local file key. */
  providerRef: string;
  purpose: MediaPurpose;
  ownerType: MediaOwnerType | null;
  ownerId: string | null;
  altText: string | null;
  /** Present for images/videos; `null` for documents. */
  width: number | null;
  height: number | null;
  /** Present for videos only. */
  durationSeconds: number | null;
  status: MediaStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Repository-level creation input — the metadata a concrete
 * implementation persists *after* an `UploadProvider` has already
 * stored the file and returned a `UploadResult` (see `providers/`).
 * Never the raw file bytes themselves.
 */
export interface CreateMediaAssetInput {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url: string;
  provider: StorageProviderName;
  providerRef: string;
  purpose: MediaPurpose;
  ownerType?: MediaOwnerType | null;
  ownerId?: string | null;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
  durationSeconds?: number | null;
  status?: MediaStatus;
}

/**
 * Deliberately narrow: everything else about a stored file (its bytes,
 * dimensions, provider, provider reference) is immutable once uploaded
 * — replacing a file is uploading a new asset, not editing this one.
 */
export interface UpdateMediaAssetInput {
  altText?: string | null;
  status?: MediaStatus;
}
