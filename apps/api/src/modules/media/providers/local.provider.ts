import { NotImplementedError } from "../../../errors";
import { STORAGE_PROVIDERS } from "../constants";

import type { FileMetadata } from "../types";
import type { UploadOptions, UploadProvider, UploadResult } from "./upload-provider.interface";

/** Configuration a real local-disk integration would need. */
export interface LocalProviderConfig {
  /** Absolute path files are written under. */
  baseDirectory: string;
  /** Public URL prefix files are served from. */
  publicBaseUrl: string;
}

/**
 * `UploadProvider` implementation for local disk storage — currently a
 * skeleton. Every method throws `NotImplementedError` rather than
 * touching the filesystem; no `fs` write/read/unlink call exists here
 * (actual file upload implementation is out of scope for this
 * foundation). Intended for development/testing — see
 * `validation/create-media-asset.schema.ts`'s production-only
 * Cloudinary requirement.
 */
export class LocalUploadProvider implements UploadProvider {
  readonly name = STORAGE_PROVIDERS.LOCAL;

  constructor(private readonly config: LocalProviderConfig) {}

  async upload(file: FileMetadata, _options: UploadOptions): Promise<UploadResult> {
    throw new NotImplementedError(
      `LocalUploadProvider.upload is not implemented yet (fileName: ${file.fileName})`,
    );
  }

  async delete(providerRef: string): Promise<void> {
    throw new NotImplementedError(
      `LocalUploadProvider.delete is not implemented yet (providerRef: ${providerRef})`,
    );
  }

  getUrl(providerRef: string): string {
    throw new NotImplementedError(
      `LocalUploadProvider.getUrl is not implemented yet (providerRef: ${providerRef})`,
    );
  }
}
