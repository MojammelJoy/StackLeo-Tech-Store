import { ADDRESS_TYPES } from "../constants";
import { formatAddressLine } from "../utils";

import type { AddressResponseDto, BillingAddressDto, ShippingAddressDto } from "../dto";
import type { AddressMapper } from "../interfaces";
import type { Address } from "../types";

function toResponseDto(address: Address): AddressResponseDto {
  return {
    id: address.id,
    type: address.type,
    label: address.label,
    isDefaultShipping: address.isDefaultShipping,
    isDefaultBilling: address.isDefaultBilling,
    recipientName: address.recipientName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    district: address.district,
    division: address.division,
    postalCode: address.postalCode,
    country: address.country,
    latitude: address.latitude,
    longitude: address.longitude,
    formattedAddress: formatAddressLine(address),
    createdAt: address.createdAt,
    updatedAt: address.updatedAt,
  };
}

function toResponseList(addresses: Address[]): AddressResponseDto[] {
  return addresses.map(toResponseDto);
}

function toBillingAddressDto(address: Address): BillingAddressDto | null {
  if (address.type !== ADDRESS_TYPES.BILLING && address.type !== ADDRESS_TYPES.BOTH) {
    return null;
  }

  return { ...toResponseDto(address), type: address.type };
}

function toShippingAddressDto(address: Address): ShippingAddressDto | null {
  if (address.type !== ADDRESS_TYPES.SHIPPING && address.type !== ADDRESS_TYPES.BOTH) {
    return null;
  }

  return { ...toResponseDto(address), type: address.type };
}

/**
 * The only place an `Address` is converted to its public response DTO
 * shape(s) — callers map through this instead of building any of them
 * by hand.
 */
export const addressMapper: AddressMapper = {
  toResponseDto,
  toResponseList,
  toBillingAddressDto,
  toShippingAddressDto,
};
