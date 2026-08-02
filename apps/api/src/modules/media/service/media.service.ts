import {
  BadRequestError,
  ConflictError,
  InternalServerError,
  NotFoundError,
} from "../../../errors";
import { logger } from "../../../logger";
import { PERMISSIONS, userHasPermission } from "../../rbac";
import { MEDIA_MAX_BULK_UPLOAD_FILES, MEDIA_STATUSES } from "../constants";
import { mediaMapper, validateFileForPurpose } from "../mapper";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { MediaOwnerType, MediaPurpose, StorageProviderName } from "../constants";
import type { MediaAssetResponseDto, UpdateMediaAssetDto, UploadMediaFieldsDto } from "../dto";
import type { MediaFilterOptions } from "../interfaces";
import type { UploadProvider } from "../providers";
import type { MediaRepository } from "../repository";
import type { MediaAsset, UploadableFile } from "../types";

/**
 * Implements every Media API operation: upload (single + multiple),
 * CRUD (metadata update — never the stored file itself; see
 * `UpdateMediaAssetInput`'s doc comment), soft delete + restore (via
 * `status`, not a separate `deletedAt` — see `prisma/schema.prisma`'s
 * `MediaAsset` doc comment), owner association lookup, and listing
 * (pagination, filtering, sorting, search). Depends on
 * `MediaRepository` (interface only; see `repository/`) for metadata
 * persistence and a *registry* of `UploadProvider`s keyed by name —
 * never a single hardcoded provider — so switching which backend is
 * active is a one-line change at the composition root
 * (`routes/media.routes.ts`), never a change to this class. Only
 * `STORAGE_PROVIDERS.LOCAL` is actually wired to a working provider
 * today (`CloudinaryUploadProvider` remains this foundation's original
 * skeleton — real Cloudinary integration is out of scope), but nothing
 * here hardcodes that.
 *
 * `actor: AuthenticatedUser | null` on read methods mirrors
 * `modules/product`/`modules/category`/`modules/brand`: a caller
 * without `media:read` only ever sees `READY` assets (pending/failed/
 * deleted are staff-only), regardless of what filters they pass — see
 * `scopeFiltersForActor`/`isVisibleTo`. Write methods take
 * `actor: AuthenticatedUser` (never null) since every mutating route
 * requires authentication + `media:*` permission at the route layer;
 * this service still receives the actor to attribute changes in logs.
 */
export class MediaService {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly uploadProviders: Partial<Record<StorageProviderName, UploadProvider>>,
    private readonly defaultProviderName: StorageProviderName,
  ) {}

  async list(
    query: ParsedQuery,
    filters: MediaFilterOptions,
    actor: AuthenticatedUser | null,
  ): Promise<PaginatedResult<MediaAssetResponseDto>> {
    const scoped = this.scopeFiltersForActor(filters, actor);
    const result = await this.mediaRepository.findAll(query, scoped);
    return { items: mediaMapper.toResponseList(result.items), meta: result.meta };
  }

  async getById(id: string, actor: AuthenticatedUser | null): Promise<MediaAssetResponseDto> {
    const asset = await this.getExistingAsset(id);
    if (!this.isVisibleTo(asset, actor)) {
      throw new NotFoundError("Media asset not found");
    }
    return mediaMapper.toResponseDto(asset);
  }

  async getByOwner(
    ownerType: MediaOwnerType,
    ownerId: string,
    purpose: MediaPurpose | undefined,
    actor: AuthenticatedUser | null,
  ): Promise<MediaAssetResponseDto[]> {
    const assets = await this.mediaRepository.findByOwner(ownerType, ownerId, purpose);
    const visible = assets.filter((asset) => this.isVisibleTo(asset, actor));
    return mediaMapper.toResponseList(visible);
  }

  async upload(
    file: UploadableFile,
    fields: UploadMediaFieldsDto,
    actor: AuthenticatedUser,
  ): Promise<MediaAssetResponseDto> {
    this.assertFileValidForPurpose(file, fields.purpose);
    const asset = await this.storeAndPersist(file, fields);
    logger.info(
      { mediaAssetId: asset.id, purpose: fields.purpose, actorId: actor.id },
      "Media asset uploaded",
    );
    return asset;
  }

  async uploadMultiple(
    files: UploadableFile[],
    fields: UploadMediaFieldsDto,
    actor: AuthenticatedUser,
  ): Promise<MediaAssetResponseDto[]> {
    if (files.length === 0) {
      throw new BadRequestError("At least one file is required");
    }
    if (files.length > MEDIA_MAX_BULK_UPLOAD_FILES) {
      throw new BadRequestError(
        `Cannot upload more than ${MEDIA_MAX_BULK_UPLOAD_FILES} files in a single request`,
      );
    }

    // Validate every file *before* storing any of them — catches a bad
    // file up front instead of leaving a partially-stored batch behind
    // when one near the end of the list turns out to be invalid.
    for (const file of files) {
      this.assertFileValidForPurpose(file, fields.purpose);
    }

    const assets = await Promise.all(files.map((file) => this.storeAndPersist(file, fields)));
    logger.info(
      { count: assets.length, purpose: fields.purpose, actorId: actor.id },
      "Multiple media assets uploaded",
    );
    return assets;
  }

  async update(
    id: string,
    dto: UpdateMediaAssetDto,
    actor: AuthenticatedUser,
  ): Promise<MediaAssetResponseDto> {
    const existing = await this.getExistingAsset(id);
    if (existing.status === MEDIA_STATUSES.DELETED) {
      throw new ConflictError("Cannot update a deleted media asset; restore it first");
    }

    const updated = await this.mediaRepository.update(id, dto);
    logger.info({ mediaAssetId: id, actorId: actor.id }, "Media asset metadata updated");
    return mediaMapper.toResponseDto(updated);
  }

  async delete(id: string, actor: AuthenticatedUser): Promise<void> {
    const existing = await this.getExistingAsset(id);
    if (existing.status === MEDIA_STATUSES.DELETED) {
      throw new ConflictError("Media asset is already deleted");
    }

    await this.mediaRepository.update(id, { status: MEDIA_STATUSES.DELETED });
    logger.info({ mediaAssetId: id, actorId: actor.id }, "Media asset soft-deleted");
  }

  /** Restores a soft-deleted asset back to `READY` — always `READY`,
   * regardless of what `status` it had before deletion (there's
   * nothing to remember it by; see `prisma/schema.prisma`'s
   * `MediaAsset` doc comment). */
  async restore(id: string, actor: AuthenticatedUser): Promise<MediaAssetResponseDto> {
    const existing = await this.getExistingAsset(id);
    if (existing.status !== MEDIA_STATUSES.DELETED) {
      throw new ConflictError("Media asset is not deleted");
    }

    const restored = await this.mediaRepository.update(id, { status: MEDIA_STATUSES.READY });
    logger.info({ mediaAssetId: id, actorId: actor.id }, "Media asset restored");
    return mediaMapper.toResponseDto(restored);
  }

  private assertFileValidForPurpose(file: UploadableFile, purpose: MediaPurpose): void {
    const validation = validateFileForPurpose(file, purpose);
    if (!validation.valid) {
      throw new BadRequestError(`"${file.fileName}" is not valid for purpose "${purpose}"`, {
        errors: validation.errors,
      });
    }
  }

  private async storeAndPersist(
    file: UploadableFile,
    fields: UploadMediaFieldsDto,
  ): Promise<MediaAssetResponseDto> {
    const provider = this.resolveProvider();
    const uploadResult = await provider.upload(file, {
      purpose: fields.purpose,
      ownerType: fields.ownerType,
      ownerId: fields.ownerId,
    });

    const asset = await this.mediaRepository.create({
      fileName: file.fileName,
      mimeType: uploadResult.mimeType,
      sizeBytes: uploadResult.sizeBytes,
      url: uploadResult.url,
      provider: provider.name,
      providerRef: uploadResult.providerRef,
      purpose: fields.purpose,
      ownerType: fields.ownerType ?? null,
      ownerId: fields.ownerId ?? null,
      altText: fields.altText ?? null,
      width: uploadResult.width ?? null,
      height: uploadResult.height ?? null,
      durationSeconds: uploadResult.durationSeconds ?? null,
      status: MEDIA_STATUSES.READY,
    });

    return mediaMapper.toResponseDto(asset);
  }

  private resolveProvider(): UploadProvider {
    const provider = this.uploadProviders[this.defaultProviderName];
    if (!provider) {
      throw new InternalServerError(
        `No upload provider is registered for "${this.defaultProviderName}"`,
      );
    }
    return provider;
  }

  private async getExistingAsset(id: string): Promise<MediaAsset> {
    const asset = await this.mediaRepository.findById(id);
    if (!asset) {
      throw new NotFoundError("Media asset not found");
    }
    return asset;
  }

  private canBypassStatusScope(actor: AuthenticatedUser | null): boolean {
    return actor !== null && userHasPermission(actor, PERMISSIONS.MEDIA_READ);
  }

  private isVisibleTo(asset: MediaAsset, actor: AuthenticatedUser | null): boolean {
    if (this.canBypassStatusScope(actor)) {
      return true;
    }
    return asset.status === MEDIA_STATUSES.READY;
  }

  private scopeFiltersForActor(
    filters: MediaFilterOptions,
    actor: AuthenticatedUser | null,
  ): MediaFilterOptions {
    if (this.canBypassStatusScope(actor)) {
      return filters;
    }
    return { ...filters, status: MEDIA_STATUSES.READY };
  }
}
