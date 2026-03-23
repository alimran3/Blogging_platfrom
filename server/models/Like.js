import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  blog: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  type: {
    type: String,
    enum: ['blog', 'comment'],
    required: true
  }
}, {
  timestamps: true
});

// Ensure a user can only like once
likeSchema.index({ user: 1, blog: 1 }, { unique: true, sparse: true });
likeSchema.index({ user: 1, comment: 1 }, { unique: true, sparse: true });

export default mongoose.model('Like', likeSchema);
