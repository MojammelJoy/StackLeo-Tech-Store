/**
 * The Media API: upload (single + multiple), get by id, list
 * (pagination, filtering, sorting, search), update metadata, soft
 * delete + restore, and owner association lookup (Product/Brand/
 * Category/User) — a real, working feature, not reusable-
 * infrastructure-only scaffolding. Built on `common/`, `database/`,
 * `logger/`, `errors/`, and `modules/rbac` (permission-gating every
 * mutation and every non-`READY` read). Only local-disk storage is a
 * real, working `UploadProvider` — `CloudinaryUploadProvider` remains
 * this foundation's original skeleton (real Cloudinary/S3 integration,
 * image optimization, and CDN integration are all explicitly out of
 * scope). Deliberately excludes product/category/brand CRUD and every
 * other domain's business logic (cart, wishlist, reviews, orders,
 * payment) — those stay out of this module.
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
  MEDIA_MAX_BULK_UPLOAD_FILES,
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
  UploadableFile,
} from "./types";

export { altTextSchema, fileNameSchema, mimeTypeSchema } from "./schemas";

export {
  createMediaAssetSchema,
  mediaIdParamsSchema,
  mediaOwnerParamsSchema,
  updateMediaAssetSchema,
  uploadMediaFieldsSchema,
} from "./validation";
export type {
  CreateMediaAssetDto,
  MediaAssetResponseDto,
  UpdateMediaAssetDto,
  UploadMediaFieldsDto,
} from "./dto";

export type { MediaFilterOptions, MediaMapper } from "./interfaces";

export { uploadMultipleFiles, uploadSingleFile } from "./middleware";

export { CloudinaryUploadProvider, LocalUploadProvider } from "./providers";
export type {
  CloudinaryProviderConfig,
  LocalProviderConfig,
  UploadOptions,
  UploadProvider,
  UploadResult,
} from "./providers";

export {
  extractImageDimensions,
  formatFileSize,
  getAllowedMimeTypes,
  getFileExtension,
  isMimeTypeAllowedForPurpose,
  mediaMapper,
  sanitizeFileName,
  validateFileForPurpose,
} from "./mapper";
export type { FileValidationResult, ImageDimensions } from "./mapper";

export { MediaPrismaRepository } from "./repository";
export type { MediaRepository } from "./repository";

export { MediaService } from "./service";

export { MediaController } from "./controller";

export { mediaRouter } from "./routes";
