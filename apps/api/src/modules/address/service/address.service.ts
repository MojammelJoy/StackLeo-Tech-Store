import { NotImplementedError } from "../../../errors";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { AddressType } from "../constants";
import type { CreateAddressDto, UpdateAddressDto } from "../dto";
import type { AddressFilterOptions } from "../interfaces";
import type { AddressRepository } from "../repository";
import type { Address } from "../types";

/**
 * Skeleton address service — the operations a concrete implementation
 * will expose once address persistence exists. Depends on
 * `AddressRepository` (interface only; see `repository/`), never on
 * Prisma directly, so this class never changes when the persistence
 * layer does. Every method throws `NotImplementedError` — no database
 * operations happen in this foundation.
 *
 * `setDefault` is the one operation with more than one obvious step
 * once implemented (unset the user's previous default, then set the
 * new one — see `AddressRepository.unsetDefaultForUser`) — still just
 * a throw here, but its own method rather than folded into `update`,
 * since "make this the default" is a distinct action from editing an
 * address's fields.
 */
export class AddressService {
  constructor(private readonly addressRepository: AddressRepository) {}

  async findById(id: string): Promise<Address | null> {
    throw new NotImplementedError(`AddressService.findById is not implemented yet (id: ${id})`);
  }

  async findByUserId(
    userId: string,
    _query: ParsedQuery,
    _filters?: AddressFilterOptions,
    _actor?: AuthenticatedUser,
  ): Promise<PaginatedResult<Address>> {
    throw new NotImplementedError(
      `AddressService.findByUserId is not implemented yet (userId: ${userId})`,
    );
  }

  async findDefaultByUserId(userId: string, type?: AddressType): Promise<Address | null> {
    throw new NotImplementedError(
      `AddressService.findDefaultByUserId is not implemented yet (userId: ${userId}, type: ${type})`,
    );
  }

  async create(_dto: CreateAddressDto, _actor: AuthenticatedUser): Promise<Address> {
    throw new NotImplementedError("AddressService.create is not implemented yet");
  }

  async update(id: string, _dto: UpdateAddressDto, _actor: AuthenticatedUser): Promise<Address> {
    throw new NotImplementedError(`AddressService.update is not implemented yet (id: ${id})`);
  }

  async delete(id: string, _actor: AuthenticatedUser): Promise<void> {
    throw new NotImplementedError(`AddressService.delete is not implemented yet (id: ${id})`);
  }

  async setDefault(id: string, _actor: AuthenticatedUser): Promise<Address> {
    throw new NotImplementedError(`AddressService.setDefault is not implemented yet (id: ${id})`);
  }
}
