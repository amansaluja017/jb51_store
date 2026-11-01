import { Request, Response } from 'express';
import {
  uploadAndSaveImage,
  getImagesByProductId,
  deleteImageById,
  deleteImageByTarget,
  reorderImages,
} from '../services/image.service.js';
import { deleteFromCloudinary } from '../services/cloudinary.js';
import {
  getImageDimensionsFromBuffer,
  validateImageDimensions,
} from '../utils/image-dimensions.js';

/**
 * POST /api/upload
 * Upload a single image file and optionally link it to a product.
 * Supports dimension validation via targetType ('hero' | 'adBanner' | 'secondAdBanner' | 'sale' | 'product' | 'badge')
 * or explicit minWidth / minHeight parameters.
 */
export async function uploadSingle(req: Request, res: Response): Promise<void> {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No image file provided in request.' });
      return;
    }

    const file = files[0];
    const { productId, productVariantId, orderIndex, folder, targetType, minWidth, minHeight } = req.body;
    const parsedOrder = orderIndex !== undefined && !isNaN(Number(orderIndex))
      ? Number(orderIndex)
      : 0;

    const parsedMinWidth = minWidth !== undefined && !isNaN(Number(minWidth)) ? Number(minWidth) : undefined;
    const parsedMinHeight = minHeight !== undefined && !isNaN(Number(minHeight)) ? Number(minHeight) : undefined;

    // 1. Pre-upload Buffer Dimension Validation
    const bufferDims = getImageDimensionsFromBuffer(file.buffer);
    if (bufferDims) {
      const preValidation = validateImageDimensions({
        width: bufferDims.width,
        height: bufferDims.height,
        targetType: typeof targetType === 'string' ? targetType : undefined,
        minWidth: parsedMinWidth,
        minHeight: parsedMinHeight,
      });

      if (!preValidation.valid) {
        res.status(400).json({
          success: false,
          error: preValidation.reason,
          dimensions: {
            width: bufferDims.width,
            height: bufferDims.height,
            format: bufferDims.format,
            aspectRatio: preValidation.aspectRatio,
          },
          rule: preValidation.rule,
        });
        return;
      }
    }

    // 2. Perform upload to Cloudinary & DB
    const result = await uploadAndSaveImage({
      buffer: file.buffer,
      folder,
      productId,
      productVariantId,
      orderIndex: parsedOrder,
    });

    // 3. Post-upload Exact Dimension Verification (via Cloudinary authoritative metadata)
    const finalWidth = result.width || (bufferDims ? bufferDims.width : 0);
    const finalHeight = result.height || (bufferDims ? bufferDims.height : 0);

    const postValidation = validateImageDimensions({
      width: finalWidth,
      height: finalHeight,
      targetType: typeof targetType === 'string' ? targetType : undefined,
      minWidth: parsedMinWidth,
      minHeight: parsedMinHeight,
    });

    if (!postValidation.valid) {
      // Remove invalid image asset from Cloudinary immediately
      if (result.publicId) {
        await deleteFromCloudinary(result.publicId).catch(() => null);
      }
      res.status(400).json({
        success: false,
        error: postValidation.reason,
        dimensions: {
          width: finalWidth,
          height: finalHeight,
          format: result.format,
          aspectRatio: postValidation.aspectRatio,
        },
        rule: postValidation.rule,
      });
      return;
    }

    res.status(200).json({
      success: true,
      url: result.url,
      publicId: result.publicId,
      width: finalWidth,
      height: finalHeight,
      aspectRatio: postValidation.aspectRatio,
      format: result.format,
      image: result.image,
      rule: postValidation.rule,
    });
  } catch (err: unknown) {
    console.error('[Upload Controller Error]:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to upload image.',
    });
  }
}

/**
 * POST /api/upload/multiple
 * Upload multiple image files in parallel and optionally link to a product.
 */
export async function uploadMultiple(req: Request, res: Response): Promise<void> {
  try {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No image files provided in request.' });
      return;
    }

    const { productId, productVariantId, startingOrderIndex, folder, targetType, minWidth, minHeight } = req.body;
    const baseOrder = startingOrderIndex !== undefined && !isNaN(Number(startingOrderIndex))
      ? Number(startingOrderIndex)
      : 0;

    const parsedMinWidth = minWidth !== undefined && !isNaN(Number(minWidth)) ? Number(minWidth) : undefined;
    const parsedMinHeight = minHeight !== undefined && !isNaN(Number(minHeight)) ? Number(minHeight) : undefined;

    // Validate all files before uploading
    for (const [idx, file] of files.entries()) {
      const bufferDims = getImageDimensionsFromBuffer(file.buffer);
      if (bufferDims) {
        const validation = validateImageDimensions({
          width: bufferDims.width,
          height: bufferDims.height,
          targetType: typeof targetType === 'string' ? targetType : undefined,
          minWidth: parsedMinWidth,
          minHeight: parsedMinHeight,
        });

        if (!validation.valid) {
          res.status(400).json({
            success: false,
            error: `File #${idx + 1} (${file.originalname || 'image'}): ${validation.reason}`,
            dimensions: bufferDims,
            rule: validation.rule,
          });
          return;
        }
      }
    }

    const uploadPromises = files.map((file, idx) =>
      uploadAndSaveImage({
        buffer: file.buffer,
        folder,
        productId,
        productVariantId,
        orderIndex: baseOrder + idx,
      })
    );

    const uploadedImages = await Promise.all(uploadPromises);

    res.status(200).json({
      success: true,
      count: uploadedImages.length,
      images: uploadedImages,
    });
  } catch (err: unknown) {
    console.error('[Multiple Upload Controller Error]:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to upload images.',
    });
  }
}

/**
 * GET /api/products/:productId/images
 * Retrieve all images for a given product ID.
 */
export async function getProductImages(req: Request, res: Response): Promise<void> {
  try {
    const { productId } = req.params;
    const images = await getImagesByProductId(productId);

    res.status(200).json({
      success: true,
      images,
    });
  } catch (err: unknown) {
    console.error('[Get Product Images Error]:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to retrieve product images.',
    });
  }
}

/**
 * DELETE /api/products/images/:id
 * Delete an image record from product_images table and remove from Cloudinary.
 */
export async function deleteProductImage(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const result = await deleteImageById(id);

    if (!result) {
      res.status(404).json({ error: 'Image record not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      deleted: result.deleted,
      cloudinary: result.cloudinary,
    });
  } catch (err: unknown) {
    console.error('[Delete Product Image Error]:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to delete image record.',
    });
  }
}

/**
 * DELETE /api/upload
 * Delete an asset directly from Cloudinary using url or publicId, and remove any matching db record.
 */
export async function deleteUpload(req: Request, res: Response): Promise<void> {
  try {
    const target = (req.query.url || req.query.publicId || req.body?.url || req.body?.publicId) as string | undefined;

    if (!target) {
      res.status(400).json({ error: 'Please provide url or publicId to delete.' });
      return;
    }

    const result = await deleteImageByTarget(target);

    res.status(200).json({
      success: true,
      target,
      cloudinary: result.cloudinary,
      dbDeleted: result.dbDeleted,
    });
  } catch (err: unknown) {
    console.error('[Delete Upload Error]:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to delete upload.',
    });
  }
}

/**
 * PATCH /api/products/images/reorder
 * Reorder product images by orderIndex.
 */
export async function reorderProductImagesHandler(req: Request, res: Response): Promise<void> {
  try {
    const { images, slug, productId } = req.body;

    if (!Array.isArray(images) || images.length === 0) {
      res.status(400).json({
        error: 'Expected images array with id and orderIndex, or slug and image URLs array.',
      });
      return;
    }

    const result = await reorderImages({
      slug,
      productId,
      images,
    });

    res.status(200).json(result);
  } catch (err: unknown) {
    console.error('[Reorder Images Controller Error]:', err);
    res.status(500).json({
      error: err instanceof Error ? err.message : 'Failed to reorder images.',
    });
  }
}
