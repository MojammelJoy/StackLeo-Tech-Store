import { formatFileSize, getFileExtension } from "./file-metadata.utils";

import type { MediaAssetResponseDto } from "../dto";
import type { MediaMapper } from "../interfaces";
import type { MediaAsset } from "../types";

function toResponseDto(asset: MediaAsset): MediaAssetResponseDto {
  return {
    id: asset.id,
    fileName: asset.fileName,
    fileExtension: getFileExtension(asset.fileName),
    mimeType: asset.mimeType,
    sizeBytes: asset.sizeBytes,
    formattedSize: formatFileSize(asset.sizeBytes),
    url: asset.url,
    provider: asset.provider,
    purpose: asset.purpose,
    ownerType: asset.ownerType,
    ownerId: asset.ownerId,
    altText: asset.altText,
    width: asset.width,
    height: asset.height,
    durationSeconds: asset.durationSeconds,
    status: asset.status,
    createdAt: asset.createdAt,
    updatedAt: asset.updatedAt,
  };
}

function toResponseList(assets: MediaAsset[]): MediaAssetResponseDto[] {
  return assets.map(toResponseDto);
}

/**
 * The only place a `MediaAsset` is converted to its public
 * `MediaAssetResponseDto` shape — callers map through this instead of
 * building the DTO by hand.
 */
export const mediaMapper: MediaMapper = { toResponseDto, toResponseList };
