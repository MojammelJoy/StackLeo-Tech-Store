import { z } from "zod";

import { USER_AVATAR_URL_MAX_LENGTH } from "../constants";

/** Only the already-uploaded asset's URL is accepted here — no file
 * storage/upload infrastructure exists yet (every provider in
 * `modules/notification` and beyond is still a skeleton), so this
 * endpoint stores avatar *metadata* only, as the task requires.
 * `null` clears the avatar. */
export const updateAvatarSchema = z.object({
  avatarUrl: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(USER_AVATAR_URL_MAX_LENGTH)
    .nullable(),
});
