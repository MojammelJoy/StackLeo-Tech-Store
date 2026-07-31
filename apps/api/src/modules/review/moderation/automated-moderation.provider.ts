import { NotImplementedError } from "../../../errors";
import { MODERATION_STRATEGIES } from "../constants";

import type {
  ModerationCheckInput,
  ModerationCheckResult,
  ModerationProvider,
} from "./moderation-provider.interface";

/**
 * Configuration a real automated (e.g. keyword/profanity-filter or
 * third-party content-moderation-API) screening strategy would need.
 * Deliberately not sourced from the shared `config/` module — this is a
 * skeleton with no actual filtering logic anywhere in it (out of scope
 * for this foundation), so requiring real configuration to even
 * construct this class would force every environment to configure a
 * service nothing here uses yet.
 */
export interface AutomatedModerationProviderConfig {
  blockedKeywords: string[];
}

/**
 * `ModerationProvider` implementation for automated screening —
 * currently a skeleton. `check` throws `NotImplementedError` rather
 * than evaluating `body`/`title` against any rule set; actual keyword
 * matching or third-party moderation-API integration is out of scope
 * for this foundation.
 */
export class AutomatedModerationProvider implements ModerationProvider {
  readonly name = MODERATION_STRATEGIES.AUTOMATED;

  constructor(private readonly config: AutomatedModerationProviderConfig) {}

  async check(input: ModerationCheckInput): Promise<ModerationCheckResult> {
    throw new NotImplementedError(
      `AutomatedModerationProvider.check is not implemented yet (reviewId: ${input.reviewId})`,
    );
  }
}
