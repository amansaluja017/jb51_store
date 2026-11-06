export interface CloudinaryTransformOptions {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit' | 'thumb' | 'scale';
  quality?: 'auto' | 'auto:good' | 'auto:eco' | 'auto:low' | number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  dpr?: number;
}

/**
 * Optimizes Cloudinary image URLs with on-the-fly resizing, WebP formatting,
 * and automatic quality compression.
 * If the URL is not from Cloudinary, it is returned safely unchanged.
 */
export function getOptimizedImageUrl(
  url?: string | null,
  options: CloudinaryTransformOptions = {}
): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed.includes('res.cloudinary.com') || !trimmed.includes('/image/upload/')) {
    return trimmed;
  }

  const uploadSegment = '/image/upload/';
  const uploadIndex = trimmed.indexOf(uploadSegment);
  if (uploadIndex === -1) return trimmed;

  const prefix = trimmed.slice(0, uploadIndex + uploadSegment.length);
  let remainder = trimmed.slice(uploadIndex + uploadSegment.length);

  // Check if remainder already contains dynamic transformation segment (e.g. w_300,c_fill,q_auto)
  const firstSlashIndex = remainder.indexOf('/');
  if (firstSlashIndex !== -1) {
    const firstSegment = remainder.slice(0, firstSlashIndex);
    // If it contains Cloudinary transform prefixes (w_, h_, c_, q_, f_), strip it to prevent duplicate accumulation
    if (/c_|w_|h_|q_|f_/.test(firstSegment)) {
      remainder = remainder.slice(firstSlashIndex + 1);
    }
  }

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = options;

  const transforms: string[] = [];
  if (crop) transforms.push(`c_${crop}`);
  if (width) transforms.push(`w_${Math.round(width)}`);
  if (height) transforms.push(`h_${Math.round(height)}`);
  if (quality) transforms.push(`q_${quality}`);
  if (format) transforms.push(`f_${format}`);

  const transformString = transforms.join(',');
  return `${prefix}${transformString}/${remainder}`;
}

/**
 * Common device presets tailored for mobile layouts to maximize scroll FPS
 * and reduce memory consumption.
 */
export const ImagePresets = {
  // 120x120 square for inventory rows, select product modals, order lines
  thumbnail: { width: 140, height: 140, crop: 'fill' as const, quality: 'auto' as const, format: 'auto' as const },
  // 420x540 4:5 aspect ratio for catalog outfit cards in 2-column or list grid
  card: { width: 440, height: 550, crop: 'fill' as const, quality: 'auto' as const, format: 'auto' as const },
  // 800x1000 max resolution for ProductDetailsModal full image zoom
  detail: { width: 800, height: 1000, crop: 'limit' as const, quality: 'auto' as const, format: 'auto' as const },
  // 180x180 thumbnail for customer reviews with attachments
  review: { width: 200, height: 200, crop: 'fill' as const, quality: 'auto' as const, format: 'auto' as const },
};

