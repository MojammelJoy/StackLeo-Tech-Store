import { Router } from "express";

import { healthHandler, livenessHandler, readinessHandler } from "../health";
import { asyncHandler } from "../utils";

/**
 * Unversioned, infra-facing health endpoints. Mounted at the application
 * root (not under /api/v1) since load balancers and orchestrators probe
 * these without any awareness of API versioning.
 *
 * Explicitly typed via the public `Router` export from "express" — an
 * inferred `const` here triggers TS2742 in composite/declaration builds,
 * since Router's structural type cannot otherwise be portably named.
 * `@types/express-serve-static-core` (Router's true origin, declared as
 * a devDependency alongside `@types/express`) must be present in
 * node_modules for this annotation's declaration emit to resolve; it is
 * never imported directly.
 */
export const healthRouter: Router = Router();

healthRouter.get("/", healthHandler);
healthRouter.get("/live", livenessHandler);
healthRouter.get("/ready", asyncHandler(readinessHandler));
