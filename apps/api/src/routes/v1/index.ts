import { Router } from "express";

import { authRouter } from "../../modules/auth";

/**
 * Root of the versioned API surface. Business routes are registered
 * here as each module's feature work lands.
 *
 * Explicitly typed via the public `Router` export from "express" — an
 * inferred `const` here triggers TS2742 in composite/declaration builds,
 * since Router's structural type cannot otherwise be portably named.
 * `@types/express-serve-static-core` (Router's true origin, declared as
 * a devDependency alongside `@types/express`) must be present in
 * node_modules for this annotation's declaration emit to resolve; it is
 * never imported directly.
 */
export const v1Router: Router = Router();

v1Router.use("/auth", authRouter);
