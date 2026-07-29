import { logger } from "./logger";
import { startServer } from "./server";

/**
 * Process entrypoint. Boots the server and ensures any startup failure is
 * logged and exits with a non-zero code rather than failing silently.
 */
startServer().catch((err: unknown) => {
  logger.fatal({ err }, "Failed to start server");
  process.exit(1);
});
