/**
 * Image dimensions parsing and validation utility for JB51 Store API.
 * Supports PNG, JPEG, GIF, and WEBP buffer inspection without external native dependencies.
 */

export type ImageTargetType =
  | 'hero'
  | 'adBanner'
  | 'secondAdBanner'
  | 'sale'
  | 'product'
  | 'badge';

export interface ImageDimensionRule {
  targetType: ImageTargetType;
  label: string;
  recommendedWidth: number;
  recommendedHeight: number;
  minWidth: number;
  minHeight: number;
  aspectRatioDescription: string;
  minAspectRatio?: number;
  maxAspectRatio?: number;
}

export const IMAGE_DIMENSION_RULES: Record<ImageTargetType, ImageDimensionRule> = {
  hero: {
    targetType: 'hero',
    label: 'Hero Slide Banner',
    recommendedWidth: 1920,
    recommendedHeight: 1080,
    minWidth: 1200,
    minHeight: 675,
    aspectRatioDescription: '16:9 Widescreen Landscape',
    minAspectRatio: 1.4,
    maxAspectRatio: 2.2,
  },
  adBanner: {
    targetType: 'adBanner',
    label: 'Primary Advertisement Banner',
    recommendedWidth: 1920,
    recommendedHeight: 820,
    minWidth: 1200,
    minHeight: 500,
    aspectRatioDescription: '16:9 to 21:9 Widescreen Banner',
    minAspectRatio: 1.5,
    maxAspectRatio: 2.6,
  },
  secondAdBanner: {
    targetType: 'secondAdBanner',
    label: 'Secondary Advertisement Banner',
    recommendedWidth: 1920,
    recommendedHeight: 820,
    minWidth: 1200,
    minHeight: 500,
    aspectRatioDescription: '16:9 to 21:9 Widescreen Banner',
    minAspectRatio: 1.5,
    maxAspectRatio: 2.6,
  },
  sale: {
    targetType: 'sale',
    label: 'Flash Sale Background Banner',
    recommendedWidth: 1920,
    recommendedHeight: 1080,
    minWidth: 1200,
    minHeight: 675,
    aspectRatioDescription: '16:9 Landscape',
    minAspectRatio: 1.4,
    maxAspectRatio: 2.2,
  },
  product: {
    targetType: 'product',
    label: 'Product Catalog Photo',
    recommendedWidth: 1200,
    recommendedHeight: 1600,
    minWidth: 600,
    minHeight: 600,
    aspectRatioDescription: '3:4 Portrait or 1:1 Square',
    minAspectRatio: 0.55,
    maxAspectRatio: 1.35,
  },
  badge: {
    targetType: 'badge',
    label: 'Outfit Badge Thumbnail',
    recommendedWidth: 500,
    recommendedHeight: 500,
    minWidth: 200,
    minHeight: 200,
    aspectRatioDescription: '1:1 Square',
    minAspectRatio: 0.8,
    maxAspectRatio: 1.25,
  },
};

/**
 * Extracts width, height, and format directly from image file Buffer headers.
 */
export function getImageDimensionsFromBuffer(buffer: Buffer): { width: number; height: number; format: string } | null {
  if (!buffer || buffer.length < 24) return null;

  try {
    // 1. PNG Header (8 bytes signature: 89 50 4E 47 0D 0A 1A 0A)
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height, format: 'png' };
    }

    // 2. GIF Header ('GIF87a' or 'GIF89a')
    if (
      buffer[0] === 0x47 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x38 &&
      (buffer[4] === 0x37 || buffer[4] === 0x39) &&
      buffer[5] === 0x61
    ) {
      const width = buffer.readUInt16LE(6);
      const height = buffer.readUInt16LE(8);
      return { width, height, format: 'gif' };
    }

    // 3. WEBP Header ('RIFF' .... 'WEBP')
    if (
      buffer[0] === 0x52 &&
      buffer[1] === 0x49 &&
      buffer[2] === 0x46 &&
      buffer[3] === 0x46 &&
      buffer[8] === 0x57 &&
      buffer[9] === 0x45 &&
      buffer[10] === 0x42 &&
      buffer[11] === 0x50
    ) {
      // VP8 standard
      if (buffer[12] === 0x56 && buffer[13] === 0x50 && buffer[14] === 0x38 && buffer[15] === 0x20) {
        if (buffer.length >= 30) {
          const width = buffer.readUInt16LE(26) & 0x3fff;
          const height = buffer.readUInt16LE(28) & 0x3fff;
          return { width, height, format: 'webp' };
        }
      }
      // VP8L lossless
      if (buffer[12] === 0x56 && buffer[13] === 0x50 && buffer[14] === 0x38 && buffer[15] === 0x4c) {
        if (buffer.length >= 25) {
          const b0 = buffer[21];
          const b1 = buffer[22];
          const b2 = buffer[23];
          const b3 = buffer[24];
          const width = 1 + (((b1 & 0x3f) << 8) | b0);
          const height = 1 + (((b3 & 0x0f) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6));
          return { width, height, format: 'webp' };
        }
      }
      // VP8X extended
      if (buffer[12] === 0x56 && buffer[13] === 0x50 && buffer[14] === 0x38 && buffer[15] === 0x58) {
        if (buffer.length >= 30) {
          const width = 1 + buffer.readUIntLE(24, 3);
          const height = 1 + buffer.readUIntLE(27, 3);
          return { width, height, format: 'webp' };
        }
      }
    }

    // 4. JPEG Header (0xFF 0xD8)
    if (buffer[0] === 0xff && buffer[1] === 0xd8) {
      let offset = 2;
      while (offset < buffer.length - 8) {
        if (buffer[offset] !== 0xff) {
          offset++;
          continue;
        }
        const marker = buffer[offset + 1];
        // SOF0 (0xC0) to SOF3 (0xC3), SOF5-SOF7, SOF9-SOF11, SOF13-SOF15 indicate frame header
        const isSOF =
          (marker >= 0xc0 && marker <= 0xc3) ||
          (marker >= 0xc5 && marker <= 0xc7) ||
          (marker >= 0xc9 && marker <= 0xcb) ||
          (marker >= 0xcd && marker <= 0xcf);

        if (isSOF) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height, format: 'jpeg' };
        }

        // Advance to next marker
        const length = buffer.readUInt16BE(offset + 2);
        offset += 2 + length;
      }
    }
  } catch (err) {
    console.warn('[getImageDimensionsFromBuffer Notice]:', err);
  }

  return null;
}

export interface DimensionValidationParams {
  width: number;
  height: number;
  targetType?: string;
  minWidth?: number;
  minHeight?: number;
}

export interface DimensionValidationResult {
  valid: boolean;
  reason?: string;
  rule?: ImageDimensionRule;
  aspectRatio: number;
}

/**
 * Validates image dimensions against minimum thresholds and target type rules.
 */
export function validateImageDimensions(params: DimensionValidationParams): DimensionValidationResult {
  const { width, height, targetType, minWidth, minHeight } = params;
  const aspectRatio = width > 0 && height > 0 ? Number((width / height).toFixed(2)) : 0;

  // Global sanity checks (corrupt/empty or absurd dimensions)
  if (width < 50 || height < 50) {
    return {
      valid: false,
      reason: `Image is too small (${width}×${height}px). Minimum supported dimensions are 50×50px.`,
      aspectRatio,
    };
  }

  if (width > 8000 || height > 8000) {
    return {
      valid: false,
      reason: `Image exceeds maximum dimension limit (${width}×${height}px). Maximum allowed is 8000×8000px.`,
      aspectRatio,
    };
  }

  // Target-specific validation if targetType is provided
  if (targetType && targetType in IMAGE_DIMENSION_RULES) {
    const rule = IMAGE_DIMENSION_RULES[targetType as ImageTargetType];
    const effectiveMinWidth = minWidth || rule.minWidth;
    const effectiveMinHeight = minHeight || rule.minHeight;

    if (width < effectiveMinWidth || height < effectiveMinHeight) {
      return {
        valid: false,
        reason: `${rule.label} dimensions too small (${width}×${height}px). Minimum required is ${effectiveMinWidth}×${effectiveMinHeight}px (Recommended: ${rule.recommendedWidth}×${rule.recommendedHeight}px, ${rule.aspectRatioDescription}).`,
        rule,
        aspectRatio,
      };
    }

    return {
      valid: true,
      rule,
      aspectRatio,
    };
  }

  // Explicit minWidth / minHeight override if passed without targetType
  if (minWidth && width < minWidth) {
    return {
      valid: false,
      reason: `Image width (${width}px) is less than required minimum of ${minWidth}px.`,
      aspectRatio,
    };
  }

  if (minHeight && height < minHeight) {
    return {
      valid: false,
      reason: `Image height (${height}px) is less than required minimum of ${minHeight}px.`,
      aspectRatio,
    };
  }

  return {
    valid: true,
    aspectRatio,
  };
}
