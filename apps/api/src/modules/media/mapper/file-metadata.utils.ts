const SIZE_UNITS = ["B", "KB", "MB", "GB"] as const;

/** Lowercased extension without the leading dot, or `""` if there isn't one. */
export function getFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf(".");
  return lastDotIndex === -1 ? "" : fileName.slice(lastDotIndex + 1).toLowerCase();
}

/** Replaces anything outside `[a-zA-Z0-9._-]` with `_` — safe to use as a storage key/path segment. */
export function sanitizeFileName(fileName: string): string {
  return fileName.trim().replace(/[^a-zA-Z0-9._-]/g, "_");
}

/** Human-readable size, e.g. `2.4 MB`. */
export function formatFileSize(sizeBytes: number): string {
  if (sizeBytes <= 0) return "0 B";

  const exponent = Math.min(
    Math.floor(Math.log(sizeBytes) / Math.log(1024)),
    SIZE_UNITS.length - 1,
  );
  const value = sizeBytes / 1024 ** exponent;
  const unit = SIZE_UNITS[exponent] ?? SIZE_UNITS[0];

  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${unit}`;
}
