export const MEDIA_FILE_NAME_MAX_LENGTH = 255;
export const MEDIA_ALT_TEXT_MAX_LENGTH = 300;

/**
 * What a media asset is used for. Deliberately spans every media-bearing
 * concept this monorepo's other foundations describe (product, brand,
 * category, user) without importing any of those modules — `ownerType`
 * (see `media.constants.ts`'s `MEDIA_OWNER_TYPES`) is the only reference
 * back to them, and it's a bare string label, not a type-level
 * dependency.
 */
export const MEDIA_PURPOSES = {
  PRODUCT_IMAGE: "product_image",
  GALLERY_IMAGE: "gallery_image",
  BRAND_LOGO: "brand_logo",
  CATEGORY_IMAGE: "category_image",
  USER_AVATAR: "user_avatar",
  PDF_MANUAL: "pdf_manual",
  WARRANTY_DOCUMENT: "warranty_document",
  VIDEO: "video",
} as const;

export type MediaPurpose = (typeof MEDIA_PURPOSES)[keyof typeof MEDIA_PURPOSES];

/**
 * What kind of entity `MediaAsset.ownerId` refers to — a label, not a
 * foreign key enforced against another module's table (no `product`/
 * `brand`/`category`/`user` model relationship exists at the database
 * level; those modules don't even have Prisma models yet either).
 */
export const MEDIA_OWNER_TYPES = {
  PRODUCT: "product",
  BRAND: "brand",
  CATEGORY: "category",
  USER: "user",
} as const;

export type MediaOwnerType = (typeof MEDIA_OWNER_TYPES)[keyof typeof MEDIA_OWNER_TYPES];

/**
 * The upload lifecycle. Uploading is inherently asynchronous once a real
 * provider is wired in — this foundation models that with a status field
 * even though nothing here actually performs an upload.
 */
export const MEDIA_STATUSES = {
  PENDING: "pending",
  READY: "ready",
  FAILED: "failed",
  DELETED: "deleted",
} as const;

export type MediaStatus = (typeof MEDIA_STATUSES)[keyof typeof MEDIA_STATUSES];

/** Which storage backend persisted a given asset. See `providers/`. */
export const STORAGE_PROVIDERS = {
  CLOUDINARY: "cloudinary",
  LOCAL: "local",
} as const;

export type StorageProviderName = (typeof STORAGE_PROVIDERS)[keyof typeof STORAGE_PROVIDERS];

/**
 * Fields the (not-yet-built) media listing endpoint will allow sorting
 * and filtering by, passed as `allowedFields` to `common/`'s
 * `parseSortParams`/`parseFilterParams`.
 */
export const MEDIA_SORTABLE_FIELDS = ["fileName", "sizeBytes", "createdAt", "updatedAt"] as const;
export const MEDIA_FILTERABLE_FIELDS = [
  "purpose",
  "ownerType",
  "ownerId",
  "status",
  "provider",
] as const;
