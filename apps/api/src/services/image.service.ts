import { db, productImages } from '@repo/db';
import { eq, asc, and } from 'drizzle-orm';
import {
  uploadBufferToCloudinary,
  deleteFromCloudinary,
  CloudinaryUploadResult,
} from './cloudinary.js';
import { reorderProductImages } from '@repo/products';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface UploadImageParams {
  buffer: Buffer;
  folder?: string;
  productId?: string;
  productVariantId?: string;
  orderIndex?: number;
}

export interface UploadImageResult extends CloudinaryUploadResult {
  image: typeof productImages.$inferSelect | null;
}

/**
 * Uploads an image buffer to Cloudinary and optionally links it to a product in the database.
 */
export async function uploadAndSaveImage(
  params: UploadImageParams
): Promise<UploadImageResult> {
  const { buffer, folder, productId, productVariantId, orderIndex = 0 } = params;

  const uploadResult = await uploadBufferToCloudinary(
    buffer,
    folder || 'jb51_store/products'
  );

  let savedImageRecord: typeof productImages.$inferSelect | null = null;
  const isUuid = typeof productId === 'string' && UUID_REGEX.test(productId);
  const isVariantUuid = typeof productVariantId === 'string' && UUID_REGEX.test(productVariantId);

  if (productId && isUuid) {
    try {
      const existingImg = await db
        .select()
        .from(productImages)
        .where(
          and(
            eq(productImages.productId, productId),
            eq(productImages.url, uploadResult.url)
          )
        );

      if (existingImg.length === 0) {
        const [inserted] = await db
          .insert(productImages)
          .values({
            productId,
            productVariantId: isVariantUuid ? productVariantId : null,
            url: uploadResult.url,
            orderIndex,
          })
          .returning();

        savedImageRecord = inserted || null;
      } else {
        savedImageRecord = existingImg[0] || null;
      }
    } catch (dbErr: unknown) {
      console.warn(
        '[ImageService Notice] Skipping DB link for image:',
        dbErr instanceof Error ? dbErr.message : dbErr
      );
    }
  }

  return {
    ...uploadResult,
    image: savedImageRecord,
  };
}

/**
 * Retrieves all images linked to a specific product, ordered by orderIndex.
 */
export async function getImagesByProductId(productId: string) {
  return await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(asc(productImages.orderIndex));
}

/**
 * Deletes an image record from the database by ID and removes the asset from Cloudinary.
 */
export async function deleteImageById(id: string) {
  const [deleted] = await db
    .delete(productImages)
    .where(eq(productImages.id, id))
    .returning();

  if (!deleted) {
    return null;
  }

  let cloudinaryResult: Record<string, unknown> | null = null;
  if (deleted.url) {
    try {
      cloudinaryResult = await deleteFromCloudinary(deleted.url);
    } catch (cldErr: unknown) {
      console.error(
        '[ImageService Cloudinary Notice]:',
        cldErr instanceof Error ? cldErr.message : cldErr
      );
    }
  }

  return {
    deleted,
    cloudinary: cloudinaryResult,
  };
}

/**
 * Deletes an image asset directly by URL or publicId and clears matching DB records.
 */
export async function deleteImageByTarget(target: string) {
  let cloudinaryResult: Record<string, unknown> | null = null;
  try {
    cloudinaryResult = await deleteFromCloudinary(target);
  } catch (cldErr: unknown) {
    console.error(
      '[ImageService Cloudinary Direct Deletion Error]:',
      cldErr instanceof Error ? cldErr.message : cldErr
    );
  }

  let dbDeleted: typeof productImages.$inferSelect | null = null;
  if (target.startsWith('http')) {
    const [deletedRow] = await db
      .delete(productImages)
      .where(eq(productImages.url, target))
      .returning();
    dbDeleted = deletedRow || null;
  }

  return {
    cloudinary: cloudinaryResult,
    dbDeleted,
  };
}

/**
 * Reorders product images given either slug with URLs, or an array of image IDs with orderIndex.
 */
export async function reorderImages(params: {
  slug?: string;
  productId?: string;
  images: Array<string | { id?: string; orderIndex?: number }>;
}) {
  const { slug, productId, images } = params;
  const targetSlug = slug || productId;

  if (targetSlug && Array.isArray(images) && (images.length === 0 || typeof images[0] === 'string')) {
    const updatedUrls = await reorderProductImages(targetSlug, images as string[]);
    return { success: true, images: updatedUrls, updatedCount: updatedUrls.length };
  }

  await db.transaction(async (tx) => {
    for (const item of images as Array<{ id?: string; orderIndex?: number }>) {
      if (item.id && typeof item.orderIndex === 'number') {
        await tx
          .update(productImages)
          .set({ orderIndex: item.orderIndex })
          .where(eq(productImages.id, item.id));
      }
    }
  });

  return { success: true, updatedCount: images.length };
}
