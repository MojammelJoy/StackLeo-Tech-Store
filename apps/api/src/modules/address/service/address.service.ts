import { BadRequestError, ConflictError, NotFoundError } from "../../../errors";
import { logger } from "../../../logger";
import { ADDRESS_TYPES, DEFAULT_ADDRESS_CONTEXTS } from "../constants";
import { addressMapper } from "../mapper";

import type { AuthenticatedUser } from "../../../auth";
import type { PaginatedResult, ParsedQuery } from "../../../common";
import type { DefaultAddressContext } from "../constants";
import type { AddressResponseDto, CreateAddressDto, UpdateAddressDto } from "../dto";
import type { AddressFilterOptions } from "../interfaces";
import type { AddressLookupOptions, AddressRepository } from "../repository";
import type { Address } from "../types";

/**
 * Implements every Address API operation: CRUD, soft delete + restore,
 * independent default-shipping/default-billing assignment, and
 * paginated/sorted/filtered listing. Depends on `AddressRepository`
 * (interface only; see `repository/`), never on Prisma directly.
 *
 * Every method takes a real `actor: AuthenticatedUser` — this module is
 * authenticated-users-only end to end, mirroring `modules/wishlist`.
 * `getOwnedAddress` is this module's ownership enforcement hook, called
 * before every read or mutation of a specific address: an address whose
 * `userId` doesn't match `actor.id` is reported as `NotFoundError`,
 * never `ForbiddenError`, so a request never confirms another user's
 * address even exists — the same treatment `modules/cart`/
 * `modules/wishlist` give a foreign cart/wishlist.
 */
export class AddressService {
  constructor(private readonly addressRepository: AddressRepository) {}

  async getById(id: string, actor: AuthenticatedUser): Promise<AddressResponseDto> {
    const address = await this.getOwnedAddress(id, actor);
    return addressMapper.toResponseDto(address);
  }

  async listForUser(
    actor: AuthenticatedUser,
    query: ParsedQuery,
    filters: AddressFilterOptions,
  ): Promise<PaginatedResult<AddressResponseDto>> {
    const result = await this.addressRepository.findByUserId(actor.id, query, filters);
    return { items: addressMapper.toResponseList(result.items), meta: result.meta };
  }

  async create(dto: CreateAddressDto, actor: AuthenticatedUser): Promise<AddressResponseDto> {
    const address = await this.addressRepository.create({
      userId: actor.id,
      type: dto.type,
      label: dto.label,
      recipientName: dto.recipientName,
      phone: dto.phone,
      line1: dto.line1,
      line2: dto.line2,
      city: dto.city,
      district: dto.district,
      division: dto.division,
      postalCode: dto.postalCode,
      country: dto.country,
      latitude: dto.latitude,
      longitude: dto.longitude,
    });

    logger.info({ addressId: address.id, actorId: actor.id }, "Address created");
    return addressMapper.toResponseDto(address);
  }

  async update(
    id: string,
    dto: UpdateAddressDto,
    actor: AuthenticatedUser,
  ): Promise<AddressResponseDto> {
    await this.getOwnedAddress(id, actor);

    const updated = await this.addressRepository.update(id, dto);
    logger.info({ addressId: id, actorId: actor.id }, "Address updated");
    return addressMapper.toResponseDto(updated);
  }

  async delete(id: string, actor: AuthenticatedUser): Promise<void> {
    await this.getOwnedAddress(id, actor);

    await this.addressRepository.softDelete(id);
    logger.info({ addressId: id, actorId: actor.id }, "Address soft-deleted");
  }

  async restore(id: string, actor: AuthenticatedUser): Promise<AddressResponseDto> {
    const existing = await this.getOwnedAddress(id, actor, { includeDeleted: true });
    if (!existing.deletedAt) {
      throw new ConflictError("Address is not deleted");
    }

    await this.addressRepository.restore(id);
    const restored = await this.getOwnedAddress(id, actor);
    logger.info({ addressId: id, actorId: actor.id }, "Address restored");
    return addressMapper.toResponseDto(restored);
  }

  async setDefaultShipping(id: string, actor: AuthenticatedUser): Promise<AddressResponseDto> {
    return this.setDefault(id, actor, DEFAULT_ADDRESS_CONTEXTS.SHIPPING);
  }

  async setDefaultBilling(id: string, actor: AuthenticatedUser): Promise<AddressResponseDto> {
    return this.setDefault(id, actor, DEFAULT_ADDRESS_CONTEXTS.BILLING);
  }

  /** Validates the address is both owned by `actor` and a valid type
   * for `context` (a billing-only address can never become the default
   * *shipping* address, and vice versa) before delegating the atomic
   * unset-then-set write to `AddressRepository.setDefaultForUser`. */
  private async setDefault(
    id: string,
    actor: AuthenticatedUser,
    context: DefaultAddressContext,
  ): Promise<AddressResponseDto> {
    const address = await this.getOwnedAddress(id, actor);
    this.assertUsableForContext(address, context);

    const updated = await this.addressRepository.setDefaultForUser(actor.id, id, context);
    logger.info({ addressId: id, actorId: actor.id, context }, "Default address updated");
    return addressMapper.toResponseDto(updated);
  }

  private assertUsableForContext(address: Address, context: DefaultAddressContext): void {
    const usable =
      context === DEFAULT_ADDRESS_CONTEXTS.SHIPPING
        ? address.type === ADDRESS_TYPES.SHIPPING || address.type === ADDRESS_TYPES.BOTH
        : address.type === ADDRESS_TYPES.BILLING || address.type === ADDRESS_TYPES.BOTH;

    if (!usable) {
      throw new BadRequestError(
        `Address type "${address.type}" cannot be used as the default ${context} address`,
      );
    }
  }

  private async getOwnedAddress(
    id: string,
    actor: AuthenticatedUser,
    options?: AddressLookupOptions,
  ): Promise<Address> {
    const address = await this.addressRepository.findById(id, options);
    if (!address || address.userId !== actor.id) {
      throw new NotFoundError("Address not found");
    }
    return address;
  }
}
