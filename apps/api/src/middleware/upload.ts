import multer from 'multer';
import { Request } from 'express';

// Multer in-memory storage configuration
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

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB file size limit
  },
  fileFilter,
});
