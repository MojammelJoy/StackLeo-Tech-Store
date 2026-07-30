/**
 * Reusable media infrastructure: domain types, DTOs + Zod validation
 * schemas (built from reusable field-level schemas in `schemas/`), the
 * repository contract (plus its currently-skeletal Prisma
 * implementation), a skeleton service, the storage-provider abstraction
 * (Cloudinary/local disk skeletons — see `providers/`), and the mapper/
 * file-metadata/MIME-type/validation utilities that support it all. No
 * controllers, routes, upload endpoints, or actual upload/Cloudinary
 * implementation live here.
 */
export {
  DOCUMENT_MIME_TYPES,
  IMAGE_MIME_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_SIZE_BYTES,
  MEDIA_ALT_TEXT_MAX_LENGTH,
  MEDIA_FILE_NAME_MAX_LENGTH,
  MEDIA_FILTERABLE_FIELDS,
  MEDIA_OWNER_TYPES,
  MEDIA_PURPOSE_MAX_SIZE_BYTES,
  MEDIA_PURPOSE_MIME_TYPES,
  MEDIA_PURPOSES,
  MEDIA_SORTABLE_FIELDS,
  MEDIA_STATUSES,
  STORAGE_PROVIDERS,
  VIDEO_MIME_TYPES,
} from "./constants";
export type { MediaOwnerType, MediaPurpose, MediaStatus, StorageProviderName } from "./constants";

export type {
  CreateMediaAssetInput,
  FileMetadata,
  MediaAsset,
  UpdateMediaAssetInput,
} from "./types";

export { altTextSchema, fileNameSchema, mimeTypeSchema } from "./schemas";

export { createMediaAssetSchema, updateMediaAssetSchema } from "./validation";
export type { CreateMediaAssetDto, MediaAssetResponseDto, UpdateMediaAssetDto } from "./dto";

export type { MediaFilterOptions, MediaMapper } from "./interfaces";

export { CloudinaryUploadProvider, LocalUploadProvider } from "./providers";
export type {
  CloudinaryProviderConfig,
  LocalProviderConfig,
  UploadOptions,
  UploadProvider,
  UploadResult,
} from "./providers";

export {
  formatFileSize,
  getAllowedMimeTypes,
  getFileExtension,
  isMimeTypeAllowedForPurpose,
  mediaMapper,
  sanitizeFileName,
  validateFileForPurpose,
} from "./mapper";
export type { FileValidationResult } from "./mapper";

export { MediaPrismaRepository } from "./repository";
export type { MediaRepository } from "./repository";

export { MediaService } from "./service";
