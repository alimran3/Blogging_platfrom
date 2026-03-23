import mongoose from 'mongoose';

const embedSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['twitter', 'facebook', 'instagram', 'youtube', 'link', 'image', 'video'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  embedData: {
    title: String,
    description: String,
    thumbnail: String,
    html: String,
    authorName: String,
    authorUrl: String,
    providerName: String,
    mediaUrl: String
  },
  position: Number
}, { _id: false });

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Blog title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  excerpt: {
    type: String,
    maxlength: [500, 'Excerpt cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Blog content is required']
  },
  coverImage: {
    url: String,
    publicId: String,
    alt: String
  },
  images: [{
    url: String,
    publicId: String,
    alt: String,
    caption: String
  }],
  embeds: [embedSchema],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  category: {
    type: String,
    enum: ['technology', 'lifestyle', 'travel', 'food', 'health', 'business', 'entertainment', 'sports', 'education', 'other'],
    default: 'other'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'private', 'unlisted'],
    default: 'public'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  readTime: {
    type: Number,
    default: 1
  },
  featured: {
    type: Boolean,
    default: false
  },
  publishedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for comments
blogSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'blog'
});

// Pre-save middleware
blogSchema.pre('save', function(next) {
  // Generate slug
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') +
      '-' + Date.now().toString(36);
  }

  // Calculate read time (average 200 words per minute)
  if (this.isModified('content')) {
    const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    this.readTime = Math.max(1, Math.ceil(wordCount / 200));
  }

  // Generate excerpt if not provided
  if (this.isModified('content') && !this.excerpt) {
    const plainText = this.content.replace(/<[^>]*>/g, '');
    this.excerpt = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
  }

  // Set published date
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  next();
});

// Update likes count
blogSchema.methods.updateLikesCount = async function() {
  this.likesCount = this.likes.length;
  return this.save({ validateBeforeSave: false });
};

// Increment views
blogSchema.methods.incrementViews = async function() {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

// Indexes
blogSchema.index({ title: 'text', content: 'text', tags: 'text' });
blogSchema.index({ author: 1, status: 1 });
blogSchema.index({ likesCount: -1 });
blogSchema.index({ createdAt: -1 });
blogSchema.index({ publishedAt: -1 });
// Note: slug index is automatically created by unique: true

export default mongoose.model('Blog', blogSchema);
