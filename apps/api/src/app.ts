import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";

import { config } from "./config";
import { errorHandler, notFoundHandler, requestId } from "./middlewares";
import { registerRoutes } from "./routes";

/**
 * Builds and configures the Express application. Does not start
 * listening — that responsibility belongs to server.ts, keeping app
 * construction (pure, testable) separate from process lifecycle.
 */
export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", true);

  app.use(requestId);
  app.use(helmet());
  app.use(
    cors({
      origin: config.cors.allowedOrigins.length > 0 ? config.cors.allowedOrigins : true,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serves files `modules/media`'s `LocalUploadProvider` writes to disk
  // back out at the same path it builds each asset's public `url` from
  // — see `config/index.ts`'s `media.localPublicUrlPath`/
  // `media.localStorageDir`.
  app.use(config.media.localPublicUrlPath, express.static(config.media.localStorageDir));

  registerRoutes(app);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
