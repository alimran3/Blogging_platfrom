import mongoose from 'mongoose';
import Blog from '../models/Blog.js';
import User from '../models/User.js';
import embedService from '../services/embedService.js';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';

export const createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, tags, category, embeds, status } = req.body;

    console.log('Creating blog - req.file:', req.file ? 'exists' : 'missing');
    console.log('Cover image file:', req.file?.originalname, 'Size:', req.file?.size);

    // Parse embeds from URLs in content
    let parsedEmbeds = [];
    if (embeds) {
      try {
        const embedUrls = typeof embeds === 'string' ? JSON.parse(embeds) : embeds;
        if (Array.isArray(embedUrls) && embedUrls.length > 0) {
          parsedEmbeds = await embedService.parseMultipleEmbeds(embedUrls);
        }
      } catch (e) {
        console.error('Error parsing embeds:', e);
      }
    }

    // Handle cover image (optional)
    let coverImage = null;
    if (req.file) {
      try {
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        console.log('Uploading to Cloudinary...');
        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'blog-covers',
          transformation: [
            { width: 1200, height: 630, crop: 'fill' },
            { quality: 'auto:best' }
          ]
        });

        console.log('Cloudinary upload success:', result.secure_url);
        coverImage = {
          url: result.secure_url,
          publicId: result.public_id
        };
      } catch (cloudinaryError) {
        console.log('Cloudinary failed, saving locally:', cloudinaryError.message);
        // Fallback: save locally
        const uploadDir = path.join(process.cwd(), 'uploads', 'blog-covers');

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileName = `cover-${Date.now()}-${req.file.originalname}`;
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, req.file.buffer);

        coverImage = {
          url: `/uploads/blog-covers/${fileName}`,
          publicId: fileName
        };
        console.log('Local file saved:', coverImage.url);
      }
    }

    const blog = await Blog.create({
      title,
      content,
      excerpt,
      tags: tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : [],
      category,
      embeds: parsedEmbeds,
      coverImage: coverImage || undefined,
      author: req.user.id,
      status: status || 'published'
    });

    // Update user's blog count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { totalBlogsPublished: 1 }
    });

    const populatedBlog = await Blog.findById(blog._id)
      .populate('author', 'username avatar bio');

    console.log('Blog created with coverImage:', populatedBlog.coverImage);

    res.status(201).json({
      success: true,
      blog: populatedBlog
    });
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filter = {
      status: 'published',
      visibility: 'public'
    };

    // Category filter
    if (req.query.category && req.query.category !== 'all') {
      filter.category = req.query.category;
    }

    // Tag filter
    if (req.query.tag) {
      filter.tags = req.query.tag.toLowerCase();
    }

    // Search filter
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Sort options
    let sort = { createdAt: -1 };
    if (req.query.sort === 'popular') {
      sort = { likesCount: -1 };
    } else if (req.query.sort === 'views') {
      sort = { views: -1 };
    } else if (req.query.sort === 'oldest') {
      sort = { createdAt: 1 };
    }

    const [blogs, total] = await Promise.all([
      Blog.find(filter)
        .populate('author', 'username avatar bio')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(filter)
    ]);

    // Add liked status if user is authenticated
    if (req.user) {
      blogs.forEach(blog => {
        blog.isLiked = blog.likes.some(
          like => like.toString() === req.user.id
        );
      });
    }

    res.json({
      success: true,
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getBlog = async (req, res) => {
  try {
    // Check if the id is a valid ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    
    let query;
    if (isValidObjectId) {
      query = { _id: req.params.id };
    } else {
      query = { slug: req.params.id };
    }

    const blog = await Blog.findOne(query)
      .populate('author', 'username avatar bio university followers following totalBlogsPublished')
      .populate({
        path: 'comments',
        match: { parentComment: null, isDeleted: false },
        populate: [
          { path: 'author', select: 'username avatar' },
          {
            path: 'replies',
            match: { isDeleted: false },
            populate: { path: 'author', select: 'username avatar' }
          }
        ],
        options: { sort: { createdAt: -1 }, limit: 20 }
      });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment view count efficiently
    await Blog.findByIdAndUpdate(blog._id, {
      $inc: { views: 1 }
    });

    // Update the views count in the returned blog object
    const blogObj = blog.toObject();
    blogObj.views = (blogObj.views || 0) + 1;

    console.log('Blog embeds:', blogObj.embeds);
    console.log('Blog has embeds:', blogObj.embeds?.length > 0);

    // Add liked status if user is authenticated
    let isLiked = false;
    if (req.user) {
      isLiked = blog.likes.some(like => like.toString() === req.user.id);
    }

    res.json({
      success: true,
      blog: {
        ...blogObj,
        isLiked
      }
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateBlog = async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check ownership
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog'
      });
    }

    const { title, content, excerpt, tags, category, embeds, status } = req.body;

    // Parse new embeds
    let parsedEmbeds = blog.embeds;
    if (embeds) {
      try {
        const embedUrls = typeof embeds === 'string' ? JSON.parse(embeds) : embeds;
        if (Array.isArray(embedUrls) && embedUrls.length > 0) {
          parsedEmbeds = await embedService.parseMultipleEmbeds(embedUrls);
        }
      } catch (e) {
        console.error('Error parsing embeds:', e);
      }
    }

    // Handle new cover image (optional)
    let coverImage = blog.coverImage;
    if (req.file) {
      // Delete old image if it's on Cloudinary
      if (blog.coverImage?.publicId && !blog.coverImage.publicId.startsWith('cover-')) {
        await cloudinary.uploader.destroy(blog.coverImage.publicId);
      }

      try {
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        const result = await cloudinary.uploader.upload(dataURI, {
          folder: 'blog-covers',
          transformation: [
            { width: 1200, height: 630, crop: 'fill' },
            { quality: 'auto:best' }
          ]
        });

        coverImage = {
          url: result.secure_url,
          publicId: result.public_id
        };
      } catch (cloudinaryError) {
        // Fallback: save locally
        const uploadDir = path.join(process.cwd(), 'uploads', 'blog-covers');

        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileName = `cover-${Date.now()}-${req.file.originalname}`;
        const filePath = path.join(uploadDir, fileName);

        fs.writeFileSync(filePath, req.file.buffer);

        coverImage = {
          url: `/uploads/blog-covers/${fileName}`,
          publicId: fileName
        };
      }
    }

    blog = await Blog.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        excerpt,
        tags: tags ? tags.split(',').map(tag => tag.trim().toLowerCase()) : blog.tags,
        category: category || blog.category,
        embeds: parsedEmbeds,
        coverImage,
        status: status || blog.status
      },
      { new: true, runValidators: true }
    ).populate('author', 'username avatar bio');

    res.json({
      success: true,
      blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blog'
      });
    }

    // Delete cover image from cloudinary if it's stored there
    if (blog.coverImage?.publicId && !blog.coverImage.publicId.startsWith('cover-')) {
      await cloudinary.uploader.destroy(blog.coverImage.publicId);
    } else if (blog.coverImage?.publicId && blog.coverImage.publicId.startsWith('cover-')) {
      // Delete local file
      const filePath = path.join(process.cwd(), 'uploads', 'blog-covers', blog.coverImage.publicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete all images
    for (const image of blog.images) {
      if (image.publicId && !image.publicId.startsWith('cover-')) {
        await cloudinary.uploader.destroy(image.publicId);
      } else if (image.publicId && image.publicId.startsWith('cover-')) {
        // Delete local file
        const filePath = path.join(process.cwd(), 'uploads', 'blog-covers', image.publicId);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await blog.deleteOne();

    // Update user's blog count
    await User.findByIdAndUpdate(blog.author, {
      $inc: { totalBlogsPublished: -1 }
    });

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const likeIndex = blog.likes.indexOf(req.user.id);

    if (likeIndex > -1) {
      // Unlike
      blog.likes.splice(likeIndex, 1);
      blog.likesCount = blog.likes.length;

      // Update author's total likes
      await User.findByIdAndUpdate(blog.author, {
        $inc: { totalLikesReceived: -1 }
      });
    } else {
      // Like
      blog.likes.push(req.user.id);
      blog.likesCount = blog.likes.length;

      // Update author's total likes
      await User.findByIdAndUpdate(blog.author, {
        $inc: { totalLikesReceived: 1 }
      });
    }

    await blog.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`blog-${blog._id}`).emit('like-update', {
      blogId: blog._id,
      likesCount: blog.likesCount
    });

    res.json({
      success: true,
      isLiked: likeIndex === -1,
      likesCount: blog.likesCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getTopBlogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const blogs = await Blog.find({
      status: 'published',
      visibility: 'public'
    })
      .populate('author', 'username avatar')
      .sort({ likesCount: -1 })
      .limit(limit)
      .select('title slug coverImage likesCount commentsCount readTime createdAt category');

    res.json({
      success: true,
      blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getUserBlogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      Blog.find({
        author: req.params.userId,
        status: 'published',
        visibility: 'public'
      })
        .populate('author', 'username avatar bio')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Blog.countDocuments({
        author: req.params.userId,
        status: 'published',
        visibility: 'public'
      })
    ]);

    res.json({
      success: true,
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const parseEmbed = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL is required'
      });
    }

    const embed = await embedService.parseEmbed(url);

    res.json({
      success: true,
      embed
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
