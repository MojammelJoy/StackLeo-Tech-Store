import type { Logger } from "../logger";
import type { Server } from "node:http";

interface GracefulShutdownOptions {
  server: Server;
  logger: Logger;
  cleanup: Array<() => Promise<void>>;
  timeoutMs?: number;
}

/**
 * Registers SIGTERM/SIGINT handlers that stop accepting new connections,
 * run every provided cleanup function (closing DB/Redis connections,
 * etc.), and exit — forcing a hard exit if shutdown takes too long.
 */
export function registerGracefulShutdown({
  server,
  logger,
  cleanup,
  timeoutMs = 10_000,
}: GracefulShutdownOptions): void {
  let shuttingDown = false;

  const shutdown = (signal: string): void => {
    if (shuttingDown) return;
    shuttingDown = true;

    logger.info({ signal }, "Received shutdown signal, closing server gracefully");

    const forceExit = setTimeout(() => {
      logger.error("Graceful shutdown timed out, forcing exit");
      process.exit(1);
    }, timeoutMs);

    server.close((err) => {
      if (err) {
        logger.error({ err }, "Error while closing HTTP server");
      }

      Promise.all(cleanup.map((fn) => fn()))
        .then(() => {
          logger.info("Cleanup complete, exiting");
          clearTimeout(forceExit);
          process.exit(err ? 1 : 0);
        })
        .catch((cleanupErr: unknown) => {
          logger.error({ err: cleanupErr }, "Error during cleanup");
          clearTimeout(forceExit);
          process.exit(1);
        });
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}
