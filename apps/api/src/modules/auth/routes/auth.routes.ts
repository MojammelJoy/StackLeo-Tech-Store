import { Router } from "express";

import { authenticate } from "../../../auth";
import { validateRequest } from "../../../common";
import { UserPrismaRepository } from "../../user";
import { AuthController } from "../controller";
import { AuthPrismaRepository } from "../repository";
import { AuthService } from "../service";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  sessionIdParamsSchema,
  verifyEmailSchema,
} from "../validation";

const userRepository = new UserPrismaRepository();
const authRepository = new AuthPrismaRepository();
const authService = new AuthService(userRepository, authRepository);
const authController = new AuthController(authService);

/**
 * The full Authentication API surface, mounted at `/api/v1/auth` (see
 * `routes/v1/index.ts`). `/refresh` and `/logout` deliberately take no
 * body schema — both read the refresh token from its cookie (falling
 * back to an optional `refreshToken` body field), and neither has any
 * other required input.
 */
export const authRouter: Router = Router();

authRouter.post("/register", validateRequest({ body: registerSchema }), authController.register);
authRouter.post("/login", validateRequest({ body: loginSchema }), authController.login);
authRouter.post("/logout", authController.logout);
authRouter.post("/refresh", authController.refresh);
authRouter.post(
  "/verify-email",
  validateRequest({ body: verifyEmailSchema }),
  authController.verifyEmail,
);
authRouter.post(
  "/forgot-password",
  validateRequest({ body: forgotPasswordSchema }),
  authController.forgotPassword,
);
authRouter.post(
  "/reset-password",
  validateRequest({ body: resetPasswordSchema }),
  authController.resetPassword,
);
authRouter.post(
  "/change-password",
  authenticate,
  validateRequest({ body: changePasswordSchema }),
  authController.changePassword,
);

authRouter.get("/me", authenticate, authController.getCurrentUser);

authRouter.get("/sessions", authenticate, authController.listSessions);
authRouter.delete("/sessions", authenticate, authController.revokeOtherSessions);
authRouter.delete(
  "/sessions/:sessionId",
  authenticate,
  validateRequest({ params: sessionIdParamsSchema }),
  authController.revokeSession,
);
