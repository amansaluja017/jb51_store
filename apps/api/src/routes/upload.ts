import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { db, productImages } from '@repo/db';
import { eq, asc, and } from 'drizzle-orm';
import { uploadBufferToCloudinary, deleteFromCloudinary } from '../services/cloudinary.js';

const router: Router = Router();

// Multer memory storage configuration
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only image files are allowed.`));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB limit
  },
  fileFilter,
});

/**
 * POST /api/upload
 * Upload a single image to Cloudinary and optionally link it to a product/variant in product_images table.
 */
router.post(
  '/upload',
  upload.any(),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No image file provided in request.' });
        return;
      }

      const file = files[0];
      const { productId, productVariantId, orderIndex, folder } = req.body;

      const uploadResult = await uploadBufferToCloudinary(
        file.buffer,
        folder || 'jb51_store/products'
      );

      let savedImageRecord = null;
      const isUuid = typeof productId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
      const isVariantUuid = typeof productVariantId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productVariantId);

      if (productId && isUuid) {
        try {
          const parsedOrder = orderIndex !== undefined && !isNaN(Number(orderIndex))
            ? Number(orderIndex)
            : 0;

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
                productId: productId,
                productVariantId: isVariantUuid ? productVariantId : null,
                url: uploadResult.url,
                orderIndex: parsedOrder,
              })
              .returning();

            savedImageRecord = inserted;
          } else {
            savedImageRecord = existingImg[0];
          }
        } catch (dbErr: any) {
          console.warn('[Upload Route Notice] Skipping DB link for image:', dbErr?.message || dbErr);
        }
      }

      res.status(200).json({
        success: true,
        url: uploadResult.url,
        publicId: uploadResult.publicId,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        image: savedImageRecord,
      });
    } catch (err: any) {
      console.error('[Upload Route Error]:', err);
      res.status(500).json({
        error: err.message || 'Failed to upload image.',
      });
    }
  }
);

/**
 * POST /api/upload/multiple
 * Upload multiple images to Cloudinary in parallel and optionally link to product.
 */
router.post(
  '/upload/multiple',
  upload.array('images', 15),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[] | undefined;
      if (!files || files.length === 0) {
        res.status(400).json({ error: 'No image files provided in request.' });
        return;
      }

      const { productId, productVariantId, startingOrderIndex, folder } = req.body;
      const baseOrder = startingOrderIndex !== undefined && !isNaN(Number(startingOrderIndex))
        ? Number(startingOrderIndex)
        : 0;

      const uploadPromises = files.map(async (file, idx) => {
        const result = await uploadBufferToCloudinary(
          file.buffer,
          folder || 'jb51_store/products'
        );

        let savedImageRecord = null;
        const isUuid = typeof productId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
        const isVariantUuid = typeof productVariantId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productVariantId);

        if (productId && isUuid) {
          try {
            const existingImg = await db
              .select()
              .from(productImages)
              .where(
                and(
                  eq(productImages.productId, productId),
                  eq(productImages.url, result.url)
                )
              );

            if (existingImg.length === 0) {
              const [inserted] = await db
                .insert(productImages)
                .values({
                  productId: productId,
                  productVariantId: isVariantUuid ? productVariantId : null,
                  url: result.url,
                  orderIndex: baseOrder + idx,
                })
                .returning();
              savedImageRecord = inserted;
            } else {
              savedImageRecord = existingImg[0];
            }
          } catch (dbErr: any) {
            console.warn('[Multiple Upload Route Notice] Skipping DB link for image:', dbErr?.message || dbErr);
          }
        }

        return {
          url: result.url,
          publicId: result.publicId,
          width: result.width,
          height: result.height,
          format: result.format,
          image: savedImageRecord,
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);

      res.status(200).json({
        success: true,
        count: uploadedImages.length,
        images: uploadedImages,
      });
    } catch (err: any) {
      console.error('[Multiple Upload Route Error]:', err);
      res.status(500).json({
        error: err.message || 'Failed to upload images.',
      });
    }
  }
);

/**
 * GET /api/products/:productId/images
 * Retrieve all images for a given product ordered by orderIndex
 */
router.get(
  '/products/:productId/images',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { productId } = req.params;
      const images = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, productId))
        .orderBy(asc(productImages.orderIndex));

      res.status(200).json({
        success: true,
        images,
      });
    } catch (err: any) {
      console.error('[Get Product Images Error]:', err);
      res.status(500).json({
        error: err.message || 'Failed to retrieve product images.',
      });
    }
  }
);

/**
 * DELETE /api/products/images/:id
 * Delete an image record from product_images table and remove the asset from Cloudinary
 */
router.delete(
  '/products/images/:id',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const [deleted] = await db
        .delete(productImages)
        .where(eq(productImages.id, id))
        .returning();

      if (!deleted) {
        res.status(404).json({ error: 'Image record not found.' });
        return;
      }

      // Also delete from Cloudinary
      let cloudinaryResult = null;
      if (deleted.url) {
        try {
          cloudinaryResult = await deleteFromCloudinary(deleted.url);
        } catch (cldErr: any) {
          console.error('[Cloudinary Deletion Notice]:', cldErr?.message || cldErr);
        }
      }

      res.status(200).json({
        success: true,
        deleted,
        cloudinary: cloudinaryResult,
      });
    } catch (err: any) {
      console.error('[Delete Product Image Error]:', err);
      res.status(500).json({
        error: err.message || 'Failed to delete image record.',
      });
    }
  }
);

/**
 * DELETE /api/upload
 * Delete an asset directly from Cloudinary using url or publicId, and remove any matching db record
 */
router.delete(
  '/upload',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const target = (req.query.url || req.query.publicId || req.body?.url || req.body?.publicId) as string | undefined;

      if (!target) {
        res.status(400).json({ error: 'Please provide url or publicId to delete.' });
        return;
      }

      // Delete from Cloudinary
      let cloudinaryResult = null;
      try {
        cloudinaryResult = await deleteFromCloudinary(target);
      } catch (cldErr: any) {
        console.error('[Cloudinary Direct Deletion Error]:', cldErr?.message || cldErr);
      }

      // If a full URL was provided, also delete corresponding database record if one exists
      let dbDeleted = null;
      if (target.startsWith('http')) {
        const [deletedRow] = await db
          .delete(productImages)
          .where(eq(productImages.url, target))
          .returning();
        dbDeleted = deletedRow;
      }

      res.status(200).json({
        success: true,
        target,
        cloudinary: cloudinaryResult,
        dbDeleted,
      });
    } catch (err: any) {
      console.error('[Delete Upload Error]:', err);
      res.status(500).json({
        error: err.message || 'Failed to delete upload.',
      });
    }
  }
);

/**
 * PATCH /api/products/images/reorder
 * Update orderIndex for an array of images: { images: [{ id: string, orderIndex: number }] }
 */
router.patch(
  '/products/images/reorder',
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { images } = req.body;
      if (!Array.isArray(images) || images.length === 0) {
        res.status(400).json({ error: 'Expected images array with id and orderIndex.' });
        return;
      }

      await db.transaction(async (tx: any) => {
        for (const item of images) {
          if (item.id && typeof item.orderIndex === 'number') {
            await tx
              .update(productImages)
              .set({ orderIndex: item.orderIndex })
              .where(eq(productImages.id, item.id));
          }
        }
      });

      res.status(200).json({ success: true, updatedCount: images.length });
    } catch (err: any) {
      console.error('[Reorder Images Error]:', err);
      res.status(500).json({
        error: err.message || 'Failed to reorder images.',
      });
    }
  }
);

export default router;
