import express from 'express';
const router = express.Router();
import * as commentController from '../controllers/commentController.js';
import { protect } from '../middleware/auth.js';

router.get('/blog/:blogId', commentController.getComments);
router.post('/blog/:blogId', protect, commentController.createComment);
router.put('/:id', protect, commentController.updateComment);
router.delete('/:id', protect, commentController.deleteComment);
router.post('/:id/like', protect, commentController.likeComment);

export default router;
