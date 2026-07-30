import type { MediaOwnerType, MediaPurpose, StorageProviderName } from "../constants";
import type { FileMetadata } from "../types";

export interface UploadOptions {
  purpose: MediaPurpose;
  ownerType?: MediaOwnerType;
  ownerId?: string;
}

/** What a provider hands back after storing a file. Feeds directly into
 * a `CreateMediaAssetInput` (see `types/media.types.ts`) once the
 * repository persists the resulting record. */
export interface UploadResult {
  providerRef: string;
  url: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  durationSeconds?: number;
}

/**
 * The storage backend abstraction every concrete provider (Cloudinary,
 * local disk) implements. `service/media.service.ts` depends on this
 * interface — via a registry keyed by `StorageProviderName` — never on
 * a concrete provider directly, which is exactly what lets this
 * foundation "support multiple storage providers": adding a third
 * backend later means adding one more class that satisfies this shape,
 * not touching the service.
 */
export interface UploadProvider {
  readonly name: StorageProviderName;
  upload(file: FileMetadata, options: UploadOptions): Promise<UploadResult>;
  delete(providerRef: string): Promise<void>;
  getUrl(providerRef: string): string;
}
