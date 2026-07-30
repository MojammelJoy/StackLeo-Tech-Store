import { prisma } from "../../../database";
import { NotImplementedError } from "../../../errors";

import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { AddressType } from "../constants";
import type { AddressFilterOptions } from "../interfaces";
import type { Address, CreateAddressInput, UpdateAddressInput } from "../types";
import type { AddressRepository } from "./address.repository";
import type { PrismaClient } from "@prisma/client";

/**
 * Prisma-backed implementation of `AddressRepository` — currently a
 * skeleton. Every method throws `NotImplementedError` rather than
 * querying `prisma`, because no `Address` model exists in
 * `prisma/schema.prisma` yet; adding one is out of scope for this
 * foundation. Defaults to the shared `prisma` client from `database/`
 * (never constructs its own connection) so only the method bodies are
 * left to fill in once a model exists.
 */
export class AddressPrismaRepository implements AddressRepository {
  constructor(private readonly prismaClient: PrismaClient = prisma) {}

  async findById(id: string): Promise<Address | null> {
    throw new NotImplementedError(
      `AddressPrismaRepository.findById is not implemented yet (id: ${id})`,
    );
  }

  async findByUserId(
    userId: string,
    _query: ParsedQuery,
    _filters?: AddressFilterOptions,
  ): Promise<PaginatedResult<Address>> {
    throw new NotImplementedError(
      `AddressPrismaRepository.findByUserId is not implemented yet (userId: ${userId})`,
    );
  }

  async findDefaultByUserId(userId: string, type?: AddressType): Promise<Address | null> {
    throw new NotImplementedError(
      `AddressPrismaRepository.findDefaultByUserId is not implemented yet (userId: ${userId}, type: ${type})`,
    );
  }

  async create(_data: CreateAddressInput): Promise<Address> {
    throw new NotImplementedError("AddressPrismaRepository.create is not implemented yet");
  }

  async update(id: string, _data: UpdateAddressInput): Promise<Address> {
    throw new NotImplementedError(
      `AddressPrismaRepository.update is not implemented yet (id: ${id})`,
    );
  }

  async delete(id: string): Promise<void> {
    throw new NotImplementedError(
      `AddressPrismaRepository.delete is not implemented yet (id: ${id})`,
    );
  }

  async unsetDefaultForUser(userId: string, type?: AddressType): Promise<void> {
    throw new NotImplementedError(
      `AddressPrismaRepository.unsetDefaultForUser is not implemented yet (userId: ${userId}, type: ${type})`,
    );
  }
}
