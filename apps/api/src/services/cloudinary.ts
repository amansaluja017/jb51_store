import 'dotenv/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

export const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
};

configureCloudinary();

export const isCloudinaryConfigured = (): boolean => {
  configureCloudinary();
  return Boolean(
    process.env.CLOUDINARY_URL ||
      (process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET)
  );
};

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  folder = 'jb51_store/products',
  resourceType: 'image' | 'auto' = 'image'
): Promise<CloudinaryUploadResult> => {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET (or CLOUDINARY_URL) in environment variables.'
    );
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        timeout: 60000,
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          return reject(error || new Error('Upload to Cloudinary failed with empty result.'));
        }
        resolve({
          url: result.secure_url || result.url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    uploadStream.end(buffer);
  });
};

export const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    const cleanUrl = url.split('?')[0].split('#')[0];
    const marker = '/image/upload/';
    const index = cleanUrl.indexOf(marker);
    if (index === -1) {
      if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
        return cleanUrl;
      }
      return null;
    }

    let pathAfterUpload = cleanUrl.substring(index + marker.length);
    const versionMatch = pathAfterUpload.match(/(?:^|\/)v\d+\/(.+)$/);
    if (versionMatch) {
      pathAfterUpload = versionMatch[1];
    } else {
      pathAfterUpload = pathAfterUpload.replace(/^([a-z]{1,2}_[^/]+\/)+/, '');
      pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
    }

    // Remove file extension
    const lastDotIndex = pathAfterUpload.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      return pathAfterUpload.substring(0, lastDotIndex);
    }
    return pathAfterUpload;
  } catch {
    return null;
  }
};

export const deleteFromCloudinary = async (publicIdOrUrl: string): Promise<any> => {
  if (!isCloudinaryConfigured()) {
    console.warn('[Cloudinary Delete Notice]: Cloudinary is not configured, skipping remote deletion.');
    return null;
  }

  const publicId = publicIdOrUrl.startsWith('http')
    ? extractPublicIdFromUrl(publicIdOrUrl)
    : publicIdOrUrl;

  if (!publicId) {
    console.warn('[Cloudinary Delete Notice]: Could not extract publicId from:', publicIdOrUrl);
    return null;
  }

  return cloudinary.uploader.destroy(publicId);
};

export { cloudinary };
