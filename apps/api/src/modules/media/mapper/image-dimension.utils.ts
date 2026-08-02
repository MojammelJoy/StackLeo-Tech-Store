export interface ImageDimensions {
  width: number;
  height: number;
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const GIF_SIGNATURES = [Buffer.from("GIF87a", "ascii"), Buffer.from("GIF89a", "ascii")];

/** SOF (Start Of Frame) marker bytes that actually carry
 * width/height — `0xC0`-`0xCF` minus `0xC4` (DHT), `0xC8` (JPG,
 * reserved/unused), and `0xCC` (DAC), none of which are frame headers
 * despite falling in that numeric range. */
const JPEG_SOF_MARKERS = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);
/** Markers with no length-prefixed payload to skip over. */
const JPEG_STANDALONE_MARKERS = new Set([0xd8, 0xd9, 0x01]);

function readPngDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return null;
  }
  // IHDR is always the first chunk: 4-byte length + 4-byte type ("IHDR")
  // + width(4 BE) + height(4 BE) + ... — offset 16 is where width starts.
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

function readGifDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 10) {
    return null;
  }
  const signature = buffer.subarray(0, 6);
  if (!GIF_SIGNATURES.some((candidate) => signature.equals(candidate))) {
    return null;
  }
  return { width: buffer.readUInt16LE(6), height: buffer.readUInt16LE(8) };
}

function readJpegDimensions(buffer: Buffer): ImageDimensions | null {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null;
  }

  let offset = 2;
  while (offset + 1 < buffer.length) {
    // Marker segments are introduced by 0xFF; encoders sometimes emit
    // extra 0xFF fill bytes before the real marker byte — skip them.
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    let markerOffset = offset + 1;
    while (markerOffset < buffer.length && buffer[markerOffset] === 0xff) {
      markerOffset += 1;
    }
    const marker = buffer[markerOffset];
    if (marker === undefined) {
      return null;
    }

    if (JPEG_STANDALONE_MARKERS.has(marker) || (marker >= 0xd0 && marker <= 0xd7)) {
      offset = markerOffset + 1;
      continue;
    }

    const lengthOffset = markerOffset + 1;
    if (lengthOffset + 1 >= buffer.length) {
      return null;
    }
    const segmentLength = buffer.readUInt16BE(lengthOffset);

    if (JPEG_SOF_MARKERS.has(marker)) {
      const heightOffset = lengthOffset + 3;
      if (heightOffset + 3 >= buffer.length) {
        return null;
      }
      return {
        height: buffer.readUInt16BE(heightOffset),
        width: buffer.readUInt16BE(heightOffset + 2),
      };
    }

    offset = lengthOffset + segmentLength;
  }

  return null;
}

/**
 * Reads an image's pixel dimensions directly from its file header —
 * PNG/JPEG/GIF only (the three formats with a simple, well-defined
 * fixed-offset or short-walk header). WebP's dimensions live in one of
 * three different sub-container layouts (VP8/VP8L/VP8X), enough
 * additional complexity that it's deliberately left unsupported here
 * rather than half-implemented; this returns `null` for it (and for
 * anything else unrecognized), which `providers/local.provider.ts`
 * treats as "dimensions unknown" rather than an error — a `MediaAsset`
 * with `width`/`height` left `null` is a normal, valid state (see
 * `types/media.types.ts`).
 *
 * Deliberately reads header bytes only — no decoding, resizing, or
 * re-encoding happens anywhere in this function, which is what keeps
 * this "metadata extraction," not "image optimization" (explicitly out
 * of scope for this API).
 */
export function extractImageDimensions(buffer: Buffer, mimeType: string): ImageDimensions | null {
  switch (mimeType) {
    case "image/png":
      return readPngDimensions(buffer);
    case "image/gif":
      return readGifDimensions(buffer);
    case "image/jpeg":
      return readJpegDimensions(buffer);
    default:
      return null;
  }
}
