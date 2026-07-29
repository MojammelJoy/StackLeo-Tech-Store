import { createServer, type Server } from "node:http";

import { createApp } from "./app";
import { config } from "./config";
import { connectDatabase, connectRedis, disconnectDatabase, disconnectRedis } from "./lib";
import { logger } from "./logger";
import { registerGracefulShutdown } from "./utils";

/**
 * Creates the HTTP server, establishes external connections, starts
 * listening, and wires up graceful shutdown. The single place that owns
 * the process's network and connection lifecycle.
 */
export async function startServer(): Promise<Server> {
  const app = createApp();
  const server = createServer(app);

  await Promise.all([connectDatabase(), connectRedis()]);

  server.listen(config.server.port, () => {
    logger.info({ port: config.server.port, env: config.env }, "StackLeo API server listening");
  });

  registerGracefulShutdown({
    server,
    logger,
    cleanup: [disconnectDatabase, disconnectRedis],
  });

  return server;
}
