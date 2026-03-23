import express from 'express';
const router = express.Router();
import * as blogController from '../controllers/blogController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import compressImage from '../middleware/imageCompression.js';

// Public routes
router.get('/', optionalAuth, blogController.getBlogs);
router.get('/top', blogController.getTopBlogs);
router.get('/:id', optionalAuth, blogController.getBlog);
router.get('/user/:userId', optionalAuth, blogController.getUserBlogs);

// Protected routes
router.post(
  '/',
  protect,
  upload.single('coverImage'),
  compressImage,
  blogController.createBlog
);

router.put(
  '/:id',
  protect,
  upload.single('coverImage'),
  compressImage,
  blogController.updateBlog
);

router.delete('/:id', protect, blogController.deleteBlog);
router.post('/:id/like', protect, blogController.likeBlog);
router.post('/parse-embed', protect, blogController.parseEmbed);

export default router;
