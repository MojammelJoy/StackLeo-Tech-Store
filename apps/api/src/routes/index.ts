import type { Express } from "express";

import { healthRouter } from "./health.routes";
import { v1Router } from "./v1";

/**
 * Mounts every route group onto the application. The single place that
 * knows the full URL surface of the API.
 */
export function registerRoutes(app: Express): void {
  app.use("/health", healthRouter);
  app.use("/api/v1", v1Router);
}
