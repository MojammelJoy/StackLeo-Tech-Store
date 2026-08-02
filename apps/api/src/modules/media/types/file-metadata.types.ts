/**
 * The raw shape describing an incoming file before it's stored — what a
 * caller has (a name, a declared MIME type, a byte size) before any
 * `UploadProvider` has done anything with it. Used by `providers/` (the
 * `upload` input) and by `mapper/file-validation.utils.ts`.
 */
export interface FileMetadata {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

/**
 * `FileMetadata` plus the actual file bytes — what
 * `service/media.service.ts` hands to `UploadProvider.upload` once
 * `middleware/upload.middleware.ts` (via multer's in-memory storage)
 * has read a multipart upload into memory. Kept as its own type rather
 * than adding `buffer` to `FileMetadata` itself: most of this module
 * (validation, MIME-type/size checks) only ever needs the declared
 * metadata, never the bytes, and keeping them separate means a
 * type-checker error immediately flags any code that tries to touch
 * file content somewhere it shouldn't need to.
 */
export interface UploadableFile extends FileMetadata {
  buffer: Buffer;
}
