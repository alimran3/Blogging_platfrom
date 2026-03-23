import express from 'express';
const router = express.Router();
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { strictLimiter } from '../middleware/rateLimiter.js';

const registerValidations = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];

const loginValidations = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

router.post(
  '/register',
  strictLimiter,
  registerValidations,
  authController.register
);

router.post(
  '/login',
  strictLimiter,
  loginValidations,
  authController.login
);

router.get('/me', protect, authController.getMe);
router.put('/profile', protect, authController.updateProfile);
router.put('/password', protect, authController.changePassword);

export default router;
