import User from '../models/User.js';
import Blog from '../models/Blog.js';
import cloudinary from '../config/cloudinary.js';

export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = { isActive: true };

    if (req.query.search) {
      filter.$or = [
        { username: { $regex: req.query.search, $options: 'i' } },
        { bio: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    let sort = { createdAt: -1 };
    if (req.query.sort === 'popular') {
      sort = { 'followers.length': -1 };
    } else if (req.query.sort === 'active') {
      sort = { lastActive: -1 };
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('username avatar bio university totalBlogsPublished lastActive')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter)
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'username avatar')
      .populate('following', 'username avatar');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get recent blogs
    const recentBlogs = await Blog.find({
      author: user._id,
      status: 'published',
      visibility: 'public'
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title slug coverImage likesCount createdAt');

    // Check if current user follows this user
    let isFollowing = false;
    if (req.user) {
      isFollowing = user.followers.some(
        follower => follower._id.toString() === req.user.id
      );
    }

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        recentBlogs,
        isFollowing
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getActiveUsers = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Users active in last 24 hours with at least one blog
    const activeUsers = await User.find({
      isActive: true,
      lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      totalBlogsPublished: { $gt: 0 }
    })
      .select('username avatar bio university lastActive totalBlogsPublished')
      .sort({ lastActive: -1 })
      .limit(limit);

    res.json({
      success: true,
      users: activeUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const followUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself'
      });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== req.params.id
      );
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== req.user.id
      );
    } else {
      // Follow
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.user.id);
    }

    await Promise.all([currentUser.save(), userToFollow.save()]);

    res.json({
      success: true,
      isFollowing: !isFollowing,
      followersCount: userToFollow.followers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    console.log('Avatar upload - file:', req.file ? 'exists' : 'missing');
    console.log('Avatar upload - user:', req.user?.id);
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete old avatar if exists
    if (user.avatar.publicId) {
      await cloudinary.uploader.destroy(user.avatar.publicId);
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    console.log('Uploading to Cloudinary...');
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'avatars',
      transformation: [
        { width: 200, height: 200, crop: 'fill', gravity: 'face' },
        { quality: 'auto:best' }
      ]
    });

    console.log('Cloudinary upload success:', result.secure_url);

    user.avatar = {
      url: result.secure_url,
      publicId: result.public_id
    };

    await user.save();

    res.json({
      success: true,
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateCoverImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const user = await User.findById(req.user.id);

    // Delete old cover if exists
    if (user.coverImage && user.coverImage.publicId) {
      await cloudinary.uploader.destroy(user.coverImage.publicId);
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'covers',
      transformation: [
        { width: 1500, height: 500, crop: 'fill' },
        { quality: 'auto:best' }
      ]
    });

    user.coverImage = {
      url: result.secure_url,
      publicId: result.public_id
    };

    await user.save();

    res.json({
      success: true,
      coverImage: user.coverImage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
