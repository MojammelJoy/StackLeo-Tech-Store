import { NotImplementedError } from "../../../errors";
import { MODERATION_STRATEGIES } from "../constants";

import type {
  ModerationCheckInput,
  ModerationCheckResult,
  ModerationProvider,
} from "./moderation-provider.interface";

/** Configuration a real manual/human-review queue integration would
 * need. */
export interface ManualModerationProviderConfig {
  queueName: string;
}

/**
 * `ModerationProvider` implementation for manual (human) review —
 * currently a skeleton. `check` throws `NotImplementedError` rather
 * than enqueueing `input` for an admin to review; a real implementation
 * would likely resolve asynchronously (a queued review, not an
 * immediate answer), but the interface stays uniform with
 * `AutomatedModerationProvider` for this foundation.
 */
export class ManualModerationProvider implements ModerationProvider {
  readonly name = MODERATION_STRATEGIES.MANUAL;

  constructor(private readonly config: ManualModerationProviderConfig) {}

  async check(input: ModerationCheckInput): Promise<ModerationCheckResult> {
    throw new NotImplementedError(
      `ManualModerationProvider.check is not implemented yet (reviewId: ${input.reviewId})`,
    );
  }
}
