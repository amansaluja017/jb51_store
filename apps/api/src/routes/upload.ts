import { Router } from 'express';
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

// Upload single image (memory buffer -> Cloudinary -> DB link)
router.post('/upload', uploadMiddleware.any(), uploadSingle);

// Upload multiple images in parallel
router.post('/upload/multiple', uploadMiddleware.array('images', 15), uploadMultiple);

// Fetch all images for a given product ID
router.get('/products/:productId/images', getProductImages);

// Delete an image record by ID and remove from Cloudinary
router.delete('/products/images/:id', deleteProductImage);

// Delete asset directly from Cloudinary & DB by URL or publicId
router.delete('/upload', deleteUpload);

// Reorder images for a product
router.patch('/products/images/reorder', reorderProductImagesHandler);

export default router;
