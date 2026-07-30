import type { MediaOwnerType, MediaPurpose, MediaStatus, StorageProviderName } from "../constants";

/**
 * Media-specific filter criteria, layered on top of `common/`'s generic
 * `ParsedQuery` (pagination/sort/search). Shared between `repository/`
 * (the contract) and `service/` (the skeleton) — the reason this lives
 * in its own `interfaces/` folder rather than inside either one.
 */
export interface MediaFilterOptions {
  purpose?: MediaPurpose;
  ownerType?: MediaOwnerType;
  ownerId?: string;
  status?: MediaStatus;
  provider?: StorageProviderName;
}
