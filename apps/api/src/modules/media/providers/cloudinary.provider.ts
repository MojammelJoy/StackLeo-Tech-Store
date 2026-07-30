import { NotImplementedError } from "../../../errors";
import { STORAGE_PROVIDERS } from "../constants";

import type { FileMetadata } from "../types";
import type { UploadOptions, UploadProvider, UploadResult } from "./upload-provider.interface";

/**
 * Configuration a real Cloudinary integration would need. Deliberately
 * not sourced from the shared `config/` module — this is a skeleton
 * with no actual Cloudinary SDK call anywhere in it (out of scope for
 * this foundation), so requiring real credentials to even construct
 * this class would force every environment to configure a service
 * nothing here uses yet.
 */
export interface CloudinaryProviderConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

/**
 * `UploadProvider` implementation for Cloudinary — currently a
 * skeleton. Every method throws `NotImplementedError` rather than
 * calling the Cloudinary API (no `cloudinary` package is installed or
 * imported here); wiring in the real SDK is out of scope for this
 * foundation.
 */
export class CloudinaryUploadProvider implements UploadProvider {
  readonly name = STORAGE_PROVIDERS.CLOUDINARY;

  constructor(private readonly config: CloudinaryProviderConfig) {}

  async upload(file: FileMetadata, _options: UploadOptions): Promise<UploadResult> {
    throw new NotImplementedError(
      `CloudinaryUploadProvider.upload is not implemented yet (fileName: ${file.fileName})`,
    );
  }

  async delete(providerRef: string): Promise<void> {
    throw new NotImplementedError(
      `CloudinaryUploadProvider.delete is not implemented yet (providerRef: ${providerRef})`,
    );
  }

  getUrl(providerRef: string): string {
    throw new NotImplementedError(
      `CloudinaryUploadProvider.getUrl is not implemented yet (providerRef: ${providerRef})`,
    );
  }
}
