// Admin middleware - Check if user has admin or moderator role
export const admin = async (req, res, next) => {
  try {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'moderator')) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin or moderator privileges required.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Super admin middleware - Only admin role (not moderator)
export const superAdmin = async (req, res, next) => {
  try {
    if (req.user && req.user.role === 'admin') {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
