import express from 'express';
const router = express.Router();
import * as uploadController from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import compressImage from '../middleware/imageCompression.js';

router.post(
  '/image',
  protect,
  upload.single('image'),
  compressImage,
  uploadController.uploadImage
);

router.post(
  '/images',
  protect,
  upload.array('images', 10),
  compressImage,
  uploadController.uploadMultipleImages
);

router.delete('/image', protect, uploadController.deleteImage);

export default router;
