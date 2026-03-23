import User from '../models/User.js';
import crypto from 'crypto';

// Store reset tokens temporarily (in production, use Redis)
const resetTokens = new Map();

// Verify hobby and get reset token
export const verifyHobby = async (req, res) => {
  try {
    const { email, securityHobby } = req.body;

    if (!email || !securityHobby) {
      return res.status(400).json({
        success: false,
        message: 'Email and hobby are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }

    // Check if user has security hobby set
    if (!user.securityHobby) {
      return res.status(400).json({
        success: false,
        message: 'Security question not set. Please contact support.'
      });
    }

    // Verify hobby (case-insensitive)
    const hobbyMatch = user.securityHobby.toLowerCase().trim() === securityHobby.toLowerCase().trim();
    
    if (!hobbyMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect hobby answer'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Store reset token with expiry (10 minutes)
    resetTokens.set(user._id.toString(), {
      resetToken,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      email: user.email
    });

    res.json({
      success: true,
      message: 'Hobby verified successfully!',
      resetToken,
      hint: user.securityHobby
    });
  } catch (error) {
    console.error('Hobby verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Find reset token data
    let resetData = null;
    let userId = null;
    
    for (const [key, value] of resetTokens.entries()) {
      if (value.resetToken === resetToken) {
        resetData = value;
        userId = key;
        break;
      }
    }

    if (!resetData) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Check if token expired
    if (Date.now() > resetData.expiresAt) {
      resetTokens.delete(userId);
      return res.status(400).json({
        success: false,
        message: 'Reset token has expired. Please try again.'
      });
    }

    // Update password
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.password = newPassword;
    await user.save();

    // Clean up reset token
    resetTokens.delete(userId);

    res.json({
      success: true,
      message: 'Password reset successfully. Please login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Cleanup expired tokens (run every hour)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of resetTokens.entries()) {
    if (now > value.expiresAt) {
      resetTokens.delete(key);
    }
  }
}, 60 * 60 * 1000); // Every hour
