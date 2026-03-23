import Comment from '../models/Comment.js';
import Blog from '../models/Blog.js';

export const createComment = async (req, res) => {
  try {
    const { content, parentCommentId } = req.body;
    const { blogId } = req.params;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Verify parent comment exists if replying
    if (parentCommentId) {
      const parentComment = await Comment.findById(parentCommentId);
      if (!parentComment || parentComment.blog.toString() !== blogId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent comment'
        });
      }
    }

    const comment = await Comment.create({
      content,
      author: req.user.id,
      blog: blogId,
      parentComment: parentCommentId || null
    });

    await comment.populate('author', 'username avatar');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`blog-${blogId}`).emit('new-comment', {
      blogId,
      comment
    });

    res.status(201).json({
      success: true,
      comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getComments = async (req, res) => {
  try {
    const { blogId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      Comment.find({
        blog: blogId,
        parentComment: null,
        isDeleted: false
      })
        .populate('author', 'username avatar')
        .populate({
          path: 'replies',
          match: { isDeleted: false },
          populate: { path: 'author', select: 'username avatar' },
          options: { sort: { createdAt: 1 } }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Comment.countDocuments({
        blog: blogId,
        parentComment: null,
        isDeleted: false
      })
    ]);

    res.json({
      success: true,
      comments,
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

export const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this comment'
      });
    }

    comment.content = content;
    comment.isEdited = true;
    await comment.save();

    await comment.populate('author', 'username avatar');

    res.json({
      success: true,
      comment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this comment'
      });
    }

    comment.isDeleted = true;
    comment.content = '[Deleted]';
    await comment.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const likeIndex = comment.likes.indexOf(req.user.id);

    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(req.user.id);
    }

    comment.likesCount = comment.likes.length;
    await comment.save();

    res.json({
      success: true,
      isLiked: likeIndex === -1,
      likesCount: comment.likesCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
