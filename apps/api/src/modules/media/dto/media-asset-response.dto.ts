import type { MediaOwnerType, MediaPurpose, MediaStatus, StorageProviderName } from "../constants";

/**
 * The public-facing shape of a MediaAsset. Adds two read-only
 * conveniences the domain entity doesn't carry —`fileExtension` and
 * `formattedSize` — both computed by `mapper/` (via
 * `file-metadata.utils.ts`), never stored.
 */
export interface MediaAssetResponseDto {
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
  createdAt: Date;
  updatedAt: Date;
}
