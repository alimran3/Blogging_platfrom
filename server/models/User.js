import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    url: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/v1/defaults/avatar.png'
    },
    publicId: String
  },
  coverImage: {
    url: String,
    publicId: String
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  securityHobby: {
    type: String,
    required: [true, 'Security hobby is required'],
    maxlength: [100, 'Hobby cannot exceed 100 characters'],
    lowercase: true,
    trim: true
  },
  hobbies: {
    type: String,
    maxlength: [300, 'Hobbies cannot exceed 300 characters'],
    default: ''
  },
  university: {
    type: String,
    maxlength: [100, 'University name cannot exceed 100 characters']
  },
  address: {
    city: String,
    state: String,
    country: String,
    fullAddress: String
  },
  contactNumber: {
    type: String,
    match: [/^[\d\s\-+()]+$/, 'Please enter a valid phone number']
  },
  socialLinks: {
    website: String,
    twitter: String,
    linkedin: String,
    github: String
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  totalLikesReceived: {
    type: Number,
    default: 0
  },
  totalBlogsPublished: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('displayName').get(function() {
  return this.username;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update last active
userSchema.methods.updateActivity = function() {
  this.lastActive = new Date();
  return this.save({ validateBeforeSave: false });
};

// Index for better query performance
userSchema.index({ username: 'text', email: 'text' });
userSchema.index({ lastActive: -1 });
userSchema.index({ createdAt: -1 });

export default mongoose.model('User', userSchema);
