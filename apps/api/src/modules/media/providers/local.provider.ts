import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, normalize, resolve, sep } from "node:path";

import { NotFoundError } from "../../../errors";
import { STORAGE_PROVIDERS } from "../constants";
import { extractImageDimensions, sanitizeFileName } from "../mapper";

import type { UploadableFile } from "../types";
import type { UploadOptions, UploadProvider, UploadResult } from "./upload-provider.interface";

/** Configuration a real local-disk integration needs. */
export interface LocalProviderConfig {
  /** Absolute path files are written under. */
  baseDirectory: string;
  /** Public URL prefix files are served from — see `app.ts`'s
   * `express.static(config.media.localStorageDir)` mounted at this
   * same prefix. */
  publicBaseUrl: string;
}

/**
 * `UploadProvider` implementation for local disk storage — a real,
 * working provider (unlike `CloudinaryUploadProvider`, which stays this
 * foundation's original skeleton; wiring in the actual Cloudinary SDK
 * is explicitly out of scope). Intended for development/self-hosted
 * deployments where no third-party object storage is configured — see
 * `validation/`'s upload-fields schema, which requires no such thing,
 * and `config/index.ts`'s `media.localStorageDir`/`media.localPublicUrlPath`.
 *
 * Every `providerRef` is a storage key of the form
 * `"<purpose>/<uuid>-<sanitized-file-name>"`, relative to
 * `config.baseDirectory` — never a bare filename, so two uploads named
 * `photo.jpg` can never collide, and never an absolute path, so a
 * `providerRef` alone can't escape `config.baseDirectory` (see
 * `resolveWithinBaseDirectory`, which every method routes through
 * before touching the filesystem).
 */
export class LocalUploadProvider implements UploadProvider {
  readonly name = STORAGE_PROVIDERS.LOCAL;

  constructor(private readonly config: LocalProviderConfig) {}

  async upload(file: UploadableFile, options: UploadOptions): Promise<UploadResult> {
    const key = `${options.purpose}/${randomUUID()}-${sanitizeFileName(file.fileName)}`;
    const absolutePath = this.resolveWithinBaseDirectory(key);

    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, file.buffer);

    const dimensions = extractImageDimensions(file.buffer, file.mimeType);

    return {
      providerRef: key,
      url: this.getUrl(key),
      mimeType: file.mimeType,
      sizeBytes: file.buffer.length,
      width: dimensions?.width,
      height: dimensions?.height,
    };
  }

  async delete(providerRef: string): Promise<void> {
    const absolutePath = this.resolveWithinBaseDirectory(providerRef);
    try {
      await rm(absolutePath);
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") {
        throw new NotFoundError(`No local file found for provider reference "${providerRef}"`);
      }
      throw error;
    }
  }

  getUrl(providerRef: string): string {
    const normalizedBase = this.config.publicBaseUrl.endsWith("/")
      ? this.config.publicBaseUrl.slice(0, -1)
      : this.config.publicBaseUrl;
    return `${normalizedBase}/${providerRef}`;
  }

  /** Reads a previously-uploaded file's bytes back off disk — not part
   * of the `UploadProvider` interface (nothing else in this module
   * needs it), but useful for anything that wants to verify what was
   * actually written, e.g. this module's own smoke tests. */
  async readFile(providerRef: string): Promise<Buffer> {
    return readFile(this.resolveWithinBaseDirectory(providerRef));
  }

  /** Joins `key` onto `config.baseDirectory` and rejects the result if
   * it would resolve *outside* that directory — the one guard that
   * makes accepting a caller-influenced `providerRef` (as `delete`/
   * `getUrl`/`readFile` all do) safe against a path-traversal key like
   * `"../../../etc/passwd"`. */
  private resolveWithinBaseDirectory(key: string): string {
    const base = resolve(this.config.baseDirectory);
    const target = resolve(base, normalize(key));
    if (target !== base && !target.startsWith(base + sep)) {
      throw new NotFoundError(`No local file found for provider reference "${key}"`);
    }
    return target;
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
