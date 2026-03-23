import express from 'express';
const router = express.Router();
import * as adminController from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { admin, superAdmin } from '../middleware/admin.js';

// All routes require authentication and admin/moderator role
router.use(protect);
router.use(admin);

// Statistics
router.get('/stats', adminController.getStats);

// User Management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', superAdmin, adminController.updateUserRole);
router.put('/users/:id/ban', adminController.banUser);
router.delete('/users/:id', superAdmin, adminController.deleteUser);

// Blog Management
router.get('/blogs', adminController.getAllBlogs);
router.delete('/blogs/:id', adminController.deleteBlog);

// Comment Management
router.get('/comments', adminController.getAllComments);
router.delete('/comments/:id', adminController.deleteComment);

export default router;
