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
