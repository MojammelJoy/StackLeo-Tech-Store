import { Router } from "express";

import { addressRouter } from "../../modules/address";
import { adminRouter } from "../../modules/admin";
import { AuthPrismaRepository, AuthService, authRouter } from "../../modules/auth";
import { brandRouter } from "../../modules/brand";
import { cartRouter } from "../../modules/cart";
import { categoryRouter } from "../../modules/category";
import { couponRouter } from "../../modules/coupon";
import { inventoryRouter } from "../../modules/inventory";
import { mediaRouter } from "../../modules/media";
import { notificationRouter } from "../../modules/notification";
import { orderRouter } from "../../modules/order";
import { paymentRouter } from "../../modules/payment";
import { productRouter } from "../../modules/product";
import { reviewRouter } from "../../modules/review";
import { searchRouter } from "../../modules/search";
import { UserPrismaRepository, createUserRouter } from "../../modules/user";
import { wishlistRouter } from "../../modules/wishlist";

/**
 * Root of the versioned API surface. Business routes are registered
 * here as each module's feature work lands.
 *
 * `modules/user`'s router is a factory (`createUserRouter`), not a
 * ready-built router, specifically so it can be handed a real
 * `AuthService`/`AuthRepository` instance from here — the one place
 * both `modules/auth` and `modules/user` can be imported together
 * without creating a module-load cycle (see `modules/user/index.ts`'s
 * doc comment and `modules/user/routes/user.routes.ts`'s
 * `UserRouterDependencies`). This duplicates the `AuthService`/
 * `AuthPrismaRepository`/`UserPrismaRepository` instances
 * `modules/auth/routes/auth.routes.ts` already constructs for its own
 * router — intentional, matching how every other routes file in this
 * app constructs its own repository/service instances rather than
 * sharing them; the actual shared, stateful resource is the `prisma`
 * client underneath, which every repository already defaults to.
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

const userRepositoryForAuth = new UserPrismaRepository();
const authRepositoryForUser = new AuthPrismaRepository();
const authServiceForUser = new AuthService(userRepositoryForAuth, authRepositoryForUser);

const userRouter = createUserRouter({
  authService: authServiceForUser,
  authRepository: authRepositoryForUser,
});

v1Router.use("/auth", authRouter);
v1Router.use("/users", userRouter);
v1Router.use("/products", productRouter);
v1Router.use("/categories", categoryRouter);
v1Router.use("/brands", brandRouter);
v1Router.use("/inventory", inventoryRouter);
v1Router.use("/media", mediaRouter);
v1Router.use("/search", searchRouter);
v1Router.use("/cart", cartRouter);
v1Router.use("/wishlist", wishlistRouter);
v1Router.use("/addresses", addressRouter);
v1Router.use("/orders", orderRouter);
v1Router.use("/payments", paymentRouter);
v1Router.use("/coupons", couponRouter);
v1Router.use("/notifications", notificationRouter);
v1Router.use("/reviews", reviewRouter);
v1Router.use("/admin", adminRouter);
