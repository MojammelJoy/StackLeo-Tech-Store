import { config } from "../../../config";
import { MODERATION_STATUSES } from "../constants";

import type { ModerationStatus } from "../constants";

/**
 * The moderation status a newly-created review should start at. In
 * production every review is held for review before it's visible;
 * outside production (local development, automated tests) it defaults
 * to already-approved so reviews are immediately visible without a
 * moderation step in the way. Mirrors `modules/search`'s
 * `getDefaultSearchProvider()` — a prod-vs-dev default selected via
 * `config.isProduction`, not a validation rule.
 */
export function getDefaultModerationStatus(): ModerationStatus {
  return config.isProduction ? MODERATION_STATUSES.PENDING : MODERATION_STATUSES.APPROVED;
}
