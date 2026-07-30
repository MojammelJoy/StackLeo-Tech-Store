import { NotImplementedError } from "../../../errors";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { MediaOwnerType, MediaPurpose, StorageProviderName } from "../constants";
import type { CreateMediaAssetDto, UpdateMediaAssetDto } from "../dto";
import type { MediaFilterOptions } from "../interfaces";
import type { UploadProvider } from "../providers";
import type { MediaRepository } from "../repository";
import type { MediaAsset } from "../types";

/**
 * Skeleton media service — the operations a concrete implementation
 * will expose once media persistence and a real upload provider exist.
 * Depends on `MediaRepository` (interface only; see `repository/`) for
 * metadata persistence and a *registry* of `UploadProvider`s keyed by
 * name — never a single hardcoded provider — which is what actually
 * lets this foundation "support multiple storage providers": selecting
 * one at runtime (e.g. Cloudinary in production, local disk in
 * development) is a matter of choosing a registry key, not branching
 * logic baked into this class. Every method throws
 * `NotImplementedError` — no database operations, no calls to any
 * provider, and no business rules (which provider to pick, how to
 * apply a status transition, etc.) happen in this foundation.
 *
 * Write operations accept `actor: AuthenticatedUser` — the caller
 * performing the mutation — so a future concrete implementation can
 * attribute changes (audit logging, `createdBy`/`updatedBy`) without
 * every call site's signature changing later. Nothing here checks
 * `actor`'s permissions; that is `modules/rbac`'s job, applied by
 * whatever middleware sits in front of this service once it exists.
 */
export class MediaService {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly uploadProviders: Partial<Record<StorageProviderName, UploadProvider>>,
  ) {}

  async findById(id: string): Promise<MediaAsset | null> {
    throw new NotImplementedError(`MediaService.findById is not implemented yet (id: ${id})`);
  }

  async findByOwner(
    ownerType: MediaOwnerType,
    ownerId: string,
    _purpose?: MediaPurpose,
  ): Promise<MediaAsset[]> {
    throw new NotImplementedError(
      `MediaService.findByOwner is not implemented yet (ownerType: ${ownerType}, ownerId: ${ownerId})`,
    );
  }

  async findAll(
    _query: ParsedQuery,
    _filters?: MediaFilterOptions,
  ): Promise<PaginatedResult<MediaAsset>> {
    throw new NotImplementedError("MediaService.findAll is not implemented yet");
  }

  async create(_dto: CreateMediaAssetDto, _actor: AuthenticatedUser): Promise<MediaAsset> {
    throw new NotImplementedError("MediaService.create is not implemented yet");
  }

  async update(
    id: string,
    _dto: UpdateMediaAssetDto,
    _actor: AuthenticatedUser,
  ): Promise<MediaAsset> {
    throw new NotImplementedError(`MediaService.update is not implemented yet (id: ${id})`);
  }

  async delete(id: string, _actor: AuthenticatedUser): Promise<void> {
    throw new NotImplementedError(`MediaService.delete is not implemented yet (id: ${id})`);
  }
}
