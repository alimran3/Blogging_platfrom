import express from 'express';
const router = express.Router();
import * as passwordResetController from '../controllers/passwordResetController.js';

// Password reset routes
router.post('/verify-hobby', passwordResetController.verifyHobby);
router.post('/reset-password', passwordResetController.resetPassword);

export default router;
