import { Router } from 'express';
import { requireAdmin } from '@repo/auth';
import { uploadMiddleware } from '../middleware/upload.js';
import {
  uploadSingle,
  uploadMultiple,
  getProductImages,
  deleteProductImage,
  deleteUpload,
  reorderProductImagesHandler,
} from '../controllers/upload.controller.js';

const router: Router = Router();

// Upload single image (memory buffer -> Cloudinary -> DB link) - Admin only
router.post('/upload', requireAdmin, uploadMiddleware.any(), uploadSingle);

// Upload multiple images in parallel - Admin only
router.post('/upload/multiple', requireAdmin, uploadMiddleware.array('images', 15), uploadMultiple);

// Fetch all images for a given product ID (public)
router.get('/products/:productId/images', getProductImages);

// Delete an image record by ID and remove from Cloudinary - Admin only
router.delete('/products/images/:id', requireAdmin, deleteProductImage);

// Delete asset directly from Cloudinary & DB by URL or publicId - Admin only
router.delete('/upload', requireAdmin, deleteUpload);

// Reorder images for a product - Admin only
router.patch('/products/images/reorder', requireAdmin, reorderProductImagesHandler);

export default router;
