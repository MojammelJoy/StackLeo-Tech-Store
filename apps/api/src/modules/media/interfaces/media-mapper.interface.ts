import type { MediaAssetResponseDto } from "../dto";
import type { MediaAsset } from "../types";

/**
 * Contract `mapper/media.mapper.ts` implements. Kept separate from
 * `mapper/` itself (mirroring `repository/`'s interface-vs-implementation
 * split) so a future alternate mapper — or a test double — can satisfy
 * the same shape without depending on the concrete implementation.
 */
export interface MediaMapper {
  toResponseDto(asset: MediaAsset): MediaAssetResponseDto;
  toResponseList(assets: MediaAsset[]): MediaAssetResponseDto[];
}
