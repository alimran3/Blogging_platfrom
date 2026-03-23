import express from 'express';
const router = express.Router();
import * as userController from '../controllers/userController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.js';
import compressImage from '../middleware/imageCompression.js';

router.get('/', userController.getUsers);
router.get('/active', userController.getActiveUsers);
router.get('/:id', optionalAuth, userController.getUser);

router.post('/:id/follow', protect, userController.followUser);

router.put(
  '/avatar',
  protect,
  upload.single('avatar'),
  compressImage,
  userController.updateAvatar
);

router.put(
  '/cover',
  protect,
  upload.single('cover'),
  compressImage,
  userController.updateCoverImage
);

export default router;
