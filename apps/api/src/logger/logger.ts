import pino from "pino";

import { config } from "../config";

/**
 * Application-wide structured logger. Pretty-printed in development for
 * readability; plain JSON in production for log aggregation pipelines.
 */
export const logger = pino({
  level: config.logger.level,
  base: { service: "stackleo-api" },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: config.isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
});

export type Logger = typeof logger;
