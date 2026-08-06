import { Router } from "express";

import { authenticate } from "../../../auth";
import { validateRequest } from "../../../common";
import { AddressController } from "../controller";
import { AddressPrismaRepository } from "../repository";
import { AddressService } from "../service";
import { addressIdParamsSchema, createAddressSchema, updateAddressSchema } from "../validation";

const addressRepository = new AddressPrismaRepository();
const addressService = new AddressService(addressRepository);
const addressController = new AddressController(addressService);

/**
 * The full Address API surface, mounted at `/api/v1/addresses` (see
 * `routes/v1/index.ts`). Every endpoint requires `authenticate` — this
 * module has no public/guest path at all (an address book only makes
 * sense once there's an account), mirroring `modules/wishlist`.
 * `AddressService` enforces ownership on every read/mutation itself, so
 * no route here needs a `:userId` param — every operation is always
 * scoped to the authenticated caller.
 */
export const addressRouter: Router = Router();

addressRouter.get("/", authenticate, addressController.list);
addressRouter.post(
  "/",
  authenticate,
  validateRequest({ body: createAddressSchema }),
  addressController.create,
);

addressRouter.get(
  "/:id",
  authenticate,
  validateRequest({ params: addressIdParamsSchema }),
  addressController.getById,
);
addressRouter.patch(
  "/:id",
  authenticate,
  validateRequest({ params: addressIdParamsSchema, body: updateAddressSchema }),
  addressController.update,
);
addressRouter.delete(
  "/:id",
  authenticate,
  validateRequest({ params: addressIdParamsSchema }),
  addressController.delete,
);

addressRouter.post(
  "/:id/restore",
  authenticate,
  validateRequest({ params: addressIdParamsSchema }),
  addressController.restore,
);
addressRouter.post(
  "/:id/default-shipping",
  authenticate,
  validateRequest({ params: addressIdParamsSchema }),
  addressController.setDefaultShipping,
);
addressRouter.post(
  "/:id/default-billing",
  authenticate,
  validateRequest({ params: addressIdParamsSchema }),
  addressController.setDefaultBilling,
);
