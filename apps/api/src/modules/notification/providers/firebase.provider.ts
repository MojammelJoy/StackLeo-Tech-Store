import { NotImplementedError } from "../../../errors";
import { PUSH_PROVIDERS } from "../constants";

import type { NotificationDeliveryResult } from "../interfaces";
import type { PushMessage, PushProvider } from "./push-provider.interface";

/** Configuration a real Firebase Cloud Messaging integration would
 * need. */
export interface FirebaseProviderConfig {
  projectId: string;
  serviceAccountKey: string;
}

/**
 * `PushProvider` implementation for Firebase Cloud Messaging —
 * currently a skeleton. `send` throws `NotImplementedError` rather than
 * calling the Firebase API (no `firebase-admin` package is installed or
 * imported here); wiring in the real SDK is out of scope for this
 * foundation.
 */
export class FirebasePushProvider implements PushProvider {
  readonly name = PUSH_PROVIDERS.FIREBASE;

  constructor(private readonly config: FirebaseProviderConfig) {}

  async send(message: PushMessage): Promise<NotificationDeliveryResult> {
    throw new NotImplementedError(
      `FirebasePushProvider.send is not implemented yet (deviceToken: ${message.deviceToken})`,
    );
  }
}
