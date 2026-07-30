import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { MediaOwnerType, MediaPurpose } from "../constants";
import type { MediaFilterOptions } from "../interfaces";
import type { CreateMediaAssetInput, MediaAsset, UpdateMediaAssetInput } from "../types";

/**
 * Persistence contract for the MediaAsset domain entity — the stored
 * metadata *about* a file, never the file bytes themselves (that's
 * `providers/`'s concern). The service depends on this interface, never
 * on a concrete implementation directly, so swapping
 * `MediaPrismaRepository` for a test double (or a different persistence
 * layer entirely) never touches service code.
 */
export interface MediaRepository {
  findById(id: string): Promise<MediaAsset | null>;
  findByOwner(
    ownerType: MediaOwnerType,
    ownerId: string,
    purpose?: MediaPurpose,
  ): Promise<MediaAsset[]>;
  findAll(query: ParsedQuery, filters?: MediaFilterOptions): Promise<PaginatedResult<MediaAsset>>;
  create(data: CreateMediaAssetInput): Promise<MediaAsset>;
  update(id: string, data: UpdateMediaAssetInput): Promise<MediaAsset>;
  delete(id: string): Promise<void>;
}
